import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Outfit, WardrobeItem } from '../domain';
import type { Palette } from '../theme/ThemeProvider';
import { Garment } from './Garment';
import { Button, useUI } from './ui';

interface OutfitCardProps {
  outfit: Outfit;
  primary?: boolean;
  compact?: boolean;
  showReasons?: boolean;
  saved: boolean;
  onFavorite: () => void;
  onWorn: () => void;
  onDetails?: () => void;
  onItem?: (item: WardrobeItem) => void;
}

export function OutfitCard({
  outfit,
  primary,
  compact,
  showReasons = true,
  saved,
  onFavorite,
  onWorn,
  onDetails,
  onItem,
}: OutfitCardProps) {
  const { palette, s } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <View style={[styles.card, !primary && { borderRadius: 20 }]}>
      <View
        style={[
          styles.art,
          primary && !compact ? { minHeight: 255 } : { minHeight: 150 },
        ]}
      >
        <OutfitGarments
          outfit={outfit}
          primary={primary}
          large={primary && !compact}
          onItem={onItem}
          onDetails={onDetails}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            saved ? 'Quitar conjunto de guardados' : 'Guardar conjunto'
          }
          accessibilityState={{ selected: saved }}
          aria-pressed={saved}
          onPress={onFavorite}
          style={styles.heart}
        >
          <Text
            style={{ fontSize: 23, color: saved ? palette.rust : palette.ink }}
          >
            {saved ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>
      <View style={{ padding: primary ? 22 : 17 }}>
        <OutfitNotes
          outfit={outfit}
          primary={primary}
          showReasons={showReasons}
        />
        <View style={[s.row, { marginTop: 20 }]}>
          <Button
            label={primary ? 'Lo usé hoy' : 'Ver conjunto'}
            onPress={primary ? onWorn : () => onDetails?.()}
            small={!primary}
            style={{ flex: 1 }}
          />
          {primary ? (
            <Button
              secondary
              label={saved ? 'Guardado' : 'Guardar'}
              onPress={onFavorite}
              style={{ flex: 1 }}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function OutfitGarments({
  outfit,
  primary,
  large,
  onItem,
  onDetails,
}: Pick<OutfitCardProps, 'outfit' | 'primary' | 'onItem' | 'onDetails'> & {
  large?: boolean;
}) {
  const { palette } = useUI();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <>
      <View style={styles.garmentLine}>
        {outfit.items.map((item) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              onItem ? `Cambiar ${item.name}` : `Ver ${item.name}`
            }
            key={item.id}
            onPress={() => (onItem ? onItem(item) : onDetails?.())}
            style={{ alignItems: 'center', paddingHorizontal: 0 }}
          >
            <Garment item={item} size={large ? 88 : 64} />
            {primary ? (
              <Text numberOfLines={2} style={styles.garmentName}>
                {item.name}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </View>
      {primary ? (
        <Text style={{ color: palette.green, fontSize: 10, marginTop: 6 }}>
          Toca una prenda para cambiarla
        </Text>
      ) : null}
    </>
  );
}

/** Reasons can be hidden; warnings always stay visible. */
function OutfitNotes({
  outfit,
  primary,
  showReasons,
}: Pick<OutfitCardProps, 'outfit' | 'primary' | 'showReasons'>) {
  const { palette, s } = useUI();
  const reasons = showReasons ? outfit.reasons.slice(0, primary ? 3 : 1) : [];
  const warnings = primary ? outfit.warnings : outfit.warnings.slice(0, 1);
  return (
    <>
      {reasons.map((reason) => (
        <Text
          key={reason}
          style={[s.subtitle, { fontSize: primary ? 12 : 11, lineHeight: 20 }]}
        >
          · {reason}
        </Text>
      ))}
      {warnings.map((warning) => (
        <Text
          key={warning}
          style={{
            color: palette.rust,
            fontSize: 11,
            lineHeight: 19,
            marginTop: 5,
          }}
        >
          {warning}
        </Text>
      ))}
    </>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.white,
      borderRadius: 24,
      overflow: 'hidden',
    },
    art: {
      backgroundColor: palette.art,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 22,
      paddingTop: 50,
    },
    garmentLine: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    garmentName: {
      maxWidth: 88,
      minHeight: 32,
      textAlign: 'center',
      fontSize: 10,
      color: palette.muted,
      marginTop: 9,
    },
    heart: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: palette.floating,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
