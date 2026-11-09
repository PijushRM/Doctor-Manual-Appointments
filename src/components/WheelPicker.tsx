import React, {useEffect, useMemo, useRef} from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {FontFamily} from 'src/configs/fonts';
import type {Theme} from 'src/configs/theme';
import {useStyles} from 'src/hooks/useTheme';
import {tick} from 'src/services/feedback';
import {AppText} from './shared/AppText';

export const WHEEL_ROW_HEIGHT = 44;
export const WHEEL_VISIBLE_ROWS = 5;
const PAD = WHEEL_ROW_HEIGHT * Math.floor(WHEEL_VISIBLE_ROWS / 2);
// A looping wheel repeats its items this many rows' worth, then quietly jumps
// back to the middle copy when it settles, so it never reaches an end.
const LOOP_ROWS = 600;
// How long to wait after the finger lifts for a fling to start.
const SETTLE_DELAY_MS = 80;

type Props = {
  items: string[];
  index: number;
  onChange: (index: number) => void;
  label: string; // for screen readers, e.g. "Hour"
  loop?: boolean;
};

const AnimatedFlatList = Animated.FlatList<number>;

// One iOS-style picker column: follows the finger, keeps spinning after a
// flick, snaps to a row, and curves rows away like a drum. Each row that
// passes the centre ticks (vibration + click sound). Tap a row to roll to it.
export const WheelPicker = ({items, index, onChange, label, loop}: Props) => {
  const styles = useStyles(makeStyles);
  const count = items.length;
  // An odd number of copies, so there is a middle one to return to.
  const enough = Math.max(3, Math.ceil(LOOP_ROWS / count));
  const copies = loop ? enough + ((enough + 1) % 2) : 1;
  const middle = Math.floor(copies / 2) * count;
  const rows = useMemo(
    () => Array.from({length: count * copies}, (_, row) => row),
    [count, copies],
  );

  const listRef = useRef<FlatList<number>>(null);
  const firstRow = useRef(middle + index).current;
  const scrollY = useRef(
    new Animated.Value(firstRow * WHEEL_ROW_HEIGHT),
  ).current;
  const centredRow = useRef(firstRow); // the row in the band right now
  const committed = useRef(index); // the last index reported or received
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const clampRow = (row: number) => Math.min(Math.max(row, 0), rows.length - 1);
  const scrollToRow = (row: number, animated: boolean) =>
    listRef.current?.scrollToOffset({
      offset: row * WHEEL_ROW_HEIGHT,
      animated,
    });

  const commit = (row: number) => {
    const next = row % count;
    if (loop && (row < count || row >= rows.length - count)) {
      centredRow.current = middle + next;
      scrollToRow(middle + next, false);
    }
    if (next !== committed.current) {
      committed.current = next;
      onChangeRef.current(next);
    }
  };

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    commit(
      clampRow(Math.round(e.nativeEvent.contentOffset.y / WHEEL_ROW_HEIGHT)),
    );
  };

  // Rows move on the native thread; JS only hears which row is centred, to tick.
  const onScroll = useMemo(
    () =>
      Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
        useNativeDriver: true,
        listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const row = Math.round(
            e.nativeEvent.contentOffset.y / WHEEL_ROW_HEIGHT,
          );
          if (row !== centredRow.current) {
            centredRow.current = row;
            tick();
          }
        },
      }),
    [scrollY],
  );

  // A new value from outside (e.g. a "Free soon" chip): roll to its nearest copy.
  useEffect(() => {
    if (index === committed.current) {
      return;
    }
    committed.current = index;
    const current = centredRow.current;
    const base = current - (current % count) + index;
    const target = loop
      ? [base - count, base, base + count].reduce((a, b) =>
          Math.abs(b - current) < Math.abs(a - current) ? b : a,
        )
      : index;
    scrollToRow(clampRow(target), true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(
    () => () => {
      if (settleTimer.current) {
        clearTimeout(settleTimer.current);
      }
    },
    [],
  );

  const step = (by: number) => {
    const next = loop
      ? (committed.current + by + count) % count
      : Math.min(Math.max(committed.current + by, 0), count - 1);
    committed.current = next;
    scrollToRow(
      centredRow.current + (next - (centredRow.current % count)),
      true,
    );
    onChange(next);
  };

  const renderRow = ({item: row}: {item: number}) => {
    const centre = row * WHEEL_ROW_HEIGHT;
    const inputRange = [-2, -1, 0, 1, 2].map(
      n => centre + n * WHEEL_ROW_HEIGHT,
    );
    const along = (outputRange: number[] | string[]) =>
      scrollY.interpolate({
        inputRange,
        outputRange: outputRange as number[],
        extrapolate: 'clamp',
      });
    return (
      <Pressable
        accessible={false}
        onPress={() => {
          scrollToRow(row, true);
          commit(row);
        }}>
        <Animated.View
          style={[
            styles.row,
            {
              opacity: along([0.25, 0.55, 1, 0.55, 0.25]),
              transform: [
                {perspective: 500},
                {
                  rotateX: along([
                    '-55deg',
                    '-28deg',
                    '0deg',
                    '28deg',
                    '55deg',
                  ]),
                },
                {scale: along([0.82, 0.92, 1, 0.92, 0.82])},
              ],
            },
          ]}>
          <AppText style={styles.text}>{items[row % count]}</AppText>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View
      style={styles.column}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{text: items[index]}}
      accessibilityActions={[{name: 'increment'}, {name: 'decrement'}]}
      onAccessibilityAction={e =>
        step(e.nativeEvent.actionName === 'increment' ? 1 : -1)
      }>
      <AnimatedFlatList
        ref={listRef}
        data={rows}
        keyExtractor={row => String(row)}
        renderItem={renderRow}
        // Offsets leave out the top padding on purpose: scrolling to row N's
        // "offset" then puts row N in the centre band, not at the top.
        getItemLayout={(_, row) => ({
          length: WHEEL_ROW_HEIGHT,
          offset: WHEEL_ROW_HEIGHT * row,
          index: row,
        })}
        initialScrollIndex={firstRow}
        initialNumToRender={WHEEL_VISIBLE_ROWS + 4}
        windowSize={7}
        maxToRenderPerBatch={20}
        contentContainerStyle={styles.content}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled // the wheel sits inside a scrolling screen
        snapToInterval={WHEEL_ROW_HEIGHT}
        decelerationRate="normal"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onScrollBeginDrag={() => {
          if (settleTimer.current) {
            clearTimeout(settleTimer.current);
          }
        }}
        onScrollEndDrag={e => {
          // No fling (a slow release): settle here; otherwise momentum ends it.
          const event = {nativeEvent: {...e.nativeEvent}} as typeof e;
          settleTimer.current = setTimeout(
            () => settle(event),
            SETTLE_DELAY_MS,
          );
        }}
        onMomentumScrollBegin={() => {
          if (settleTimer.current) {
            clearTimeout(settleTimer.current);
            settleTimer.current = null;
          }
        }}
        onMomentumScrollEnd={settle}
      />
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    column: {flex: 1},
    list: {height: WHEEL_ROW_HEIGHT * WHEEL_VISIBLE_ROWS},
    content: {paddingVertical: PAD},
    row: {
      height: WHEEL_ROW_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontFamily: FontFamily.display,
      fontSize: 24,
      lineHeight: 30,
      color: theme.colors.textBase,
    },
  });
