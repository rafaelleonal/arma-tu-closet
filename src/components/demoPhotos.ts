import { Image, type ImageSourcePropType } from 'react-native';
import type { WardrobeItem } from '../domain';

/** Bundled cut-out photos of the example wardrobe; sources and licenses in assets/demo/README.md. */
const DEMO_PHOTOS: Record<string, ImageSourcePropType> = {
  'demo2-tee-white': require('../../assets/demo/playera-blanca.png'),
  'demo2-tee-gray': require('../../assets/demo/playera-gris.png'),
  'demo2-shirt-denim': require('../../assets/demo/camisa-mezclilla.png'),
  'demo2-sweater-navy': require('../../assets/demo/sueter-oscuro.png'),
  'demo2-top-black': require('../../assets/demo/top-negro.png'),
  'demo2-jacket-denim': require('../../assets/demo/chamarra-mezclilla.png'),
  'demo2-jeans-blue': require('../../assets/demo/jeans-azules.png'),
  'demo2-dress-white': require('../../assets/demo/vestido-blanco.png'),
  'demo2-shoes-red': require('../../assets/demo/zapatos-rojos.png'),
  'demo2-boots-brown': require('../../assets/demo/botines-cafe.png'),
};

/** Only example items use these; a person's own garments show their own photo or the generic drawing. */
export function demoPhotoFor(item: WardrobeItem): ImageSourcePropType | undefined {
  return item.isDemo ? DEMO_PHOTOS[item.id] : undefined;
}

/** Width/height ratio of a bundled photo, or undefined when it is not known synchronously. */
export function photoAspect(source: ImageSourcePropType | undefined): number | undefined {
  if (!source) return undefined;
  // Native resolves bundled assets by id; react-native-web has no resolveAssetSource but its require() already carries the size.
  const resolved = (typeof source === 'object' && !Array.isArray(source) ? source : Image.resolveAssetSource?.(source as number)) as { width?: number; height?: number } | undefined;
  return resolved?.width && resolved?.height ? resolved.width / resolved.height : undefined;
}
