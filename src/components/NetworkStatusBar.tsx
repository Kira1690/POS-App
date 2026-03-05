/**
 * NetworkStatusBar
 * Thin non-blocking banner that shows offline/online network status.
 * Never blocks any user action — purely informational.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useSyncContext } from '@/context/sync/SyncContext';

type BarState = 'offline' | 'error' | 'online' | 'hidden';

export const NetworkStatusBar: React.FC = () => {
  const { syncStatus } = useSyncContext();
  const [barState, setBarState] = useState<BarState>('hidden');
  const opacity = useRef(new Animated.Value(0)).current;
  const prevStatus = useRef<string>(syncStatus);

  useEffect(() => {
    const prev = prevStatus.current;
    prevStatus.current = syncStatus;

    const wasDisrupted = prev === 'offline' || prev === 'error';
    const backOnline = wasDisrupted && syncStatus === 'idle';

    if (syncStatus === 'offline') {
      setBarState('offline');
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else if (syncStatus === 'error') {
      setBarState('error');
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else if (backOnline) {
      // Flash "Connected" briefly then hide
      setBarState('online');
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setBarState('hidden'));
    } else if (syncStatus !== 'offline' && syncStatus !== 'error') {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setBarState('hidden'));
    }
  }, [syncStatus, opacity]);

  if (barState === 'hidden') return null;

  const isOnline = barState === 'online';
  const isError = barState === 'error';

  let text = 'Offline — data will sync when reconnected';
  if (isOnline) text = 'Connected — syncing data';
  else if (isError) text = 'Sync paused — data saved locally';

  return (
    <Animated.View style={[styles.bar, isOnline ? styles.online : styles.warning, { opacity }]}>
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 12,
    zIndex: 9999,
    alignItems: 'center',
  },
  warning: {
    backgroundColor: '#fbbf24', // amber-400 — offline or sync error
  },
  online: {
    backgroundColor: '#34d399', // emerald-400 — reconnected
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
  },
});

export default NetworkStatusBar;
