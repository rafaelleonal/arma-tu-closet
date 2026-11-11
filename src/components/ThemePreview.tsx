import React from 'react';
import { Text, View } from 'react-native';
import { useCopy } from '../i18n';
import type { Palette } from '../theme/ThemeProvider';
import { DrawingSticker } from './Sticker';

/** A small Hoy screen drawn with a theme's palette: rendered app elements, not a screenshot. */
export function ThemePreview({
  preview,
  compact,
  showReasons,
}: {
  preview: Palette;
  compact: boolean;
  showReasons: boolean;
}) {
  const t = useCopy();
  const size = compact ? 26 : 34;
  return (
    <View
      style={{
        backgroundColor: preview.paper,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: preview.line,
      }}
    >
      <View
        style={{
          padding: 10,
          paddingBottom: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: preview.ink, fontSize: 12, fontWeight: '600' }}>
          {t.today.title}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            paddingHorizontal: 6,
            height: 14,
            borderRadius: 7,
            borderWidth: 1,
            borderColor: preview.line,
            backgroundColor: preview.white,
          }}
        >
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: preview.rust,
            }}
          />
          <Text style={{ color: preview.ink, fontSize: 7 }}>22°</Text>
        </View>
      </View>
      {showReasons ? (
        <View
          style={{
            marginHorizontal: 9,
            padding: 7,
            gap: 4,
            borderRadius: 7,
            backgroundColor: preview.white,
          }}
        >
          {['82%', '54%'].map((width) => (
            <View
              key={width}
              style={{
                height: 4,
                width: width as `${number}%`,
                borderRadius: 2,
                backgroundColor: preview.ink,
                opacity: 0.55,
              }}
            />
          ))}
        </View>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          minHeight: compact ? 44 : 62,
          marginTop: 4,
        }}
      >
        <DrawingSticker kind="tee" maxWidth={size} maxHeight={size} />
        <DrawingSticker kind="trousers" maxWidth={size} maxHeight={size} />
        <DrawingSticker kind="sneakers" maxWidth={size} maxHeight={size} />
      </View>
      <View
        style={{
          margin: 10,
          marginTop: 4,
          borderRadius: 10,
          backgroundColor: preview.ink,
          paddingVertical: 6,
        }}
      >
        <Text
          style={{ textAlign: 'center', color: preview.onInk, fontSize: 8 }}
        >
          {t.outfit.wore}
        </Text>
      </View>
    </View>
  );
}
