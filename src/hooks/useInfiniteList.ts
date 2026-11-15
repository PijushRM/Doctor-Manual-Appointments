import {useCallback, useEffect, useRef, useState} from 'react';
import type {Page} from 'src/services/api';
import {errorMessage} from 'src/utils/errors';
import {logger} from 'src/utils/logger';

// Drives a cursor-paginated list (see api.listPatients / listAppointments):
// first load, pull-to-refresh, and load-more as you scroll. One page at a time,
// concurrent calls are ignored, and a response is dropped if `deps` changed
// while it was on its way (e.g. the search text or tab moved on).
type Fetcher<T> = (cursor: string | null) => Promise<Page<T>>;

export type InfiniteList<T> = {
  items: T[];
  status: 'loading' | 'ready' | 'error'; // the first load only
  error: string; // why the first load failed (for a Retry message)
  refreshing: boolean; // pull-to-refresh in progress
  loadingMore: boolean; // fetching the next page
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => void;
};

export function useInfiniteList<T>(
  fetchPage: Fetcher<T>,
  deps: unknown[],
): InfiniteList<T> {
  const [items, setItems] = useState<T[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(true);
  const busyRef = useRef(false);
  const runRef = useRef(0); // bumped on reset; a stale response carries an old run
  // Read the latest fetcher without making it a dependency (it changes each render).
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const load = useCallback(async (mode: 'first' | 'refresh' | 'more') => {
    if (busyRef.current) {return;}
    if (mode === 'more' && !hasMoreRef.current) {return;}
    const run = runRef.current;
    busyRef.current = true;
    if (mode === 'first') {setStatus('loading');}
    if (mode === 'refresh') {setRefreshing(true);}
    if (mode === 'more') {setLoadingMore(true);}
    try {
      const cursor = mode === 'more' ? cursorRef.current : null;
      const page = await fetchRef.current(cursor);
      if (run !== runRef.current) {return;} // a reset happened; this page is stale
      cursorRef.current = page.nextCursor;
      hasMoreRef.current = page.nextCursor !== null;
      setHasMore(hasMoreRef.current);
      setItems(prev => (mode === 'more' ? [...prev, ...page.data] : page.data));
      setStatus('ready');
      setError('');
    } catch (e) {
      if (run !== runRef.current) {return;}
      if (mode === 'first') {
        setStatus('error');
        setError(errorMessage(e));
      } else {
        // A failed refresh or load-more keeps what's already on screen.
        logger.warn('list', `Load (${mode}) failed`, e);
      }
    } finally {
      if (run === runRef.current) {
        if (mode === 'refresh') {setRefreshing(false);}
        if (mode === 'more') {setLoadingMore(false);}
      }
      busyRef.current = false;
    }
  }, []);

  // Reset and load the first page whenever the inputs change (new search, tab…).
  useEffect(() => {
    runRef.current += 1;
    cursorRef.current = null;
    hasMoreRef.current = true;
    busyRef.current = false;
    setHasMore(true);
    setItems([]);
    load('first');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    items,
    status,
    error,
    refreshing,
    loadingMore,
    hasMore,
    refresh: useCallback(() => load('refresh'), [load]),
    loadMore: useCallback(() => load('more'), [load]),
  };
}
