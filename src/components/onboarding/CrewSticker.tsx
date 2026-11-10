import React from 'react';
import { Image, type ImageSourcePropType, type ViewStyle } from 'react-native';
import { View } from 'react-native';
import { photoAspect } from '../demoPhotos';
import { lifted } from '../Sticker';

/** The garments that talk, with their faces, as stickers; made by scripts/garment-stickers.py. */
const crew = {
  tee: require('../../../assets/garments/stickers/crew/tee.png'),
  shirt: require('../../../assets/garments/stickers/crew/shirt.png'),
  jacket: require('../../../assets/garments/stickers/crew/jacket.png'),
  sneakers: require('../../../assets/garments/stickers/crew/sneakers.png'),
  scarf: require('../../../assets/garments/stickers/crew/scarf.png'),
  dress: require('../../../assets/garments/stickers/crew/dress.png'),
} satisfies Record<string, ImageSourcePropType>;
export type CrewKind = keyof typeof crew;

/** One of the crew, `size` on its longer side. Decorative: what it says goes in text. */
export function CrewSticker({
  kind,
  size,
  style,
}: {
  kind: CrewKind;
  size: number;
  style?: ViewStyle;
}) {
  const aspect = photoAspect(crew[kind]) ?? 1;
  const box =
    aspect >= 1
      ? { width: size, height: size / aspect }
      : { width: size * aspect, height: size };
  return (
    <View style={[lifted, style]}>
      <Image
        accessible={false}
        source={crew[kind]}
        resizeMode="contain"
        style={box}
      />
    </View>
  );
}
