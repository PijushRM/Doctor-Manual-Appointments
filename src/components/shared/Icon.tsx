import React from 'react';
import Svg, {Circle, G, Path, Rect} from 'react-native-svg';

// Stroke icons copied from the canvas artboards (24×24 viewBox).
const ICONS = {
  tooth: (
    <Path d="M7 3c-2.5 0-4 2-4 4.5 0 2 .8 3.4 1.4 5 .6 1.7.6 4.5 1.6 7 .4 1 1.6 1 1.9 0 .6-2 .8-4.5 2.1-4.5s1.5 2.5 2.1 4.5c.3 1 1.5 1 1.9 0 1-2.5 1-5.3 1.6-7 .6-1.6 1.4-3 1.4-5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z" />
  ),
  shield: <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  mail: (
    <>
      <Rect x={3} y={5} width={18} height={14} rx={2} />
      <Path d="M3 7l9 6 9-6" />
    </>
  ),
  lock: (
    <>
      <Rect x={4} y={11} width={16} height={10} rx={2} />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  eye: (
    <>
      <Path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <Circle cx={12} cy={12} r={3} />
    </>
  ),
  chevronLeft: <Path d="M15 18l-6-6 6-6" />,
  chevronRight: <Path d="M9 18l6-6-6-6" />,
  chevronDown: <Path d="M6 9l6 6 6-6" />,
  plus: <Path d="M12 5v14M5 12h14" />,
  check: <Path d="M20 6L9 17l-5-5" />,
  briefcase: (
    <>
      <Rect x={3} y={7} width={18} height={13} rx={2} />
      <Path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  globe: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  bell: <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4" />,
  logout: (
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  ),
  gear: (
    <>
      <Circle cx={12} cy={12} r={3} />
      <Path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
    </>
  ),
  info: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 11v6M12 7.5v.5" />
    </>
  ),
  clock: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 7v5l3 2" />
    </>
  ),
  phone: (
    <>
      <Rect x={6} y={2} width={12} height={20} rx={2} />
      <Path d="M11 18h2" />
    </>
  ),
  upload: <Path d="M12 15V3M7 8l5-5 5 5M5 21h14" />,
  pencil: <Path d="M4 20h4L19 9l-4-4L4 16z" />,
  camera: (
    <>
      <Path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <Circle cx={12} cy={13} r={3.5} />
    </>
  ),
  file: <Path d="M4 4h10l6 6v10H4zM14 4v6h6" />,
  close: <Path d="M6 6l12 12M18 6L6 18" />,
  document: (
    <>
      <Rect x={5} y={3} width={14} height={18} rx={2} />
      <Path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  image: (
    <>
      <Rect x={3} y={3} width={18} height={18} rx={2} />
      <Circle cx={9} cy={9} r={2} />
      <Path d="M21 15l-5-5L5 21" />
    </>
  ),
  search: (
    <>
      <Circle cx={11} cy={11} r={7} />
      <Path d="M20 20l-4-4" />
    </>
  ),
  sms: <Path d="M4 5h16v11H9l-5 4zM8 10h8" />,
  whatsapp: (
    <Path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12zM9 9.5c.5 2 2 3.5 4 4l1.2-1.2 1.8.8" />
  ),
  messenger: (
    <Path d="M12 3C7 3 3 6.7 3 11.3c0 2.6 1.3 4.9 3.3 6.4V21l3-1.7c.9.3 1.8.4 2.7.4 5 0 9-3.7 9-8.4S17 3 12 3zM7.5 13l3-3 2 2 3.5-3" />
  ),
  home: <Path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
  calendar: (
    <>
      <Rect x={3} y={4} width={18} height={18} rx={3} />
      <Path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  patients: (
    <>
      <Circle cx={9} cy={8} r={4} />
      <Path d="M2 21c0-4 3-6 7-6s7 2 7 6M16 4a4 4 0 0 1 0 8M22 21c0-3-2-5-4-5.5" />
    </>
  ),
  profile: (
    <>
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
};

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  color: string;
  size?: number;
  strokeWidth?: number;
};

export const Icon = ({name, color, size = 24, strokeWidth = 1.5}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
    <G
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {ICONS[name]}
    </G>
  </Svg>
);
