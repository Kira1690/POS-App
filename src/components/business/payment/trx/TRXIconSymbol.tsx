import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface TRXIconSymbolProps {
  name: keyof typeof MaterialIcons.glyphMap;
  size?: IconSize | number;
  color?: string;
}

const SIZE_MAP: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
};

export const TRXIconSymbol: React.FC<TRXIconSymbolProps> = ({ name, size = 'md', color }) => {
  const resolvedSize = typeof size === 'string' ? SIZE_MAP[size] : size;
  return <MaterialIcons name={name} size={resolvedSize} color={color} />;
};
