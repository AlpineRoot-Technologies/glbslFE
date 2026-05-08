/**
 * Helper functions for working with CMS content (Sanity)
 */

import { urlFor } from '../lib/sanity';

/**
 * Renders Portable Text / Sanity rich text blocks as plain text.
 * Works with both Sanity Portable Text arrays and legacy Strapi block arrays.
 */
export const renderStrapiBlocks = (blocks: any[]): string => {
  if (!blocks || blocks.length === 0) return '';

  return blocks
    .map((block: any) => {
      // Sanity Portable Text style: { _type: 'block', children: [{ text }] }
      if (block._type === 'block' && block.children) {
        return block.children
          .map((child: any) => child.text || '')
          .join('');
      }
      // Legacy Strapi style
      if (block.type === 'paragraph' && block.children) {
        return block.children
          .map((child: any) => child.text || '')
          .join('');
      }
      if (block.type === 'heading' && block.children) {
        return block.children
          .map((child: any) => child.text || '')
          .join('');
      }
      if (block.type === 'list' && block.children) {
        return block.children
          .map((item: any) =>
            item.children?.map((child: any) => child.text || '').join('') || ''
          )
          .join(' ');
      }
      return '';
    })
    .join(' ')
    .trim();
};

/**
 * Maps a Sanity person document to PersonTile-compatible props.
 * Handles both Sanity direct fields and legacy Strapi nested attributes.
 */
export const mapStrapiPersonData = (person: any) => {
  return {
    id: person._id || person.id,
    name: person.name || person.attributes?.name,
    position: person.position || person.attributes?.position,
    teamSection: person.teamSection || person.attributes?.teamSection || '',
    email: person.email || person.attributes?.email || '',
    phone: person.phone || person.attributes?.phone || '',
    order: person.order ?? person.attributes?.order ?? 0,
    // For Sanity images, return the image object itself so getStrapiMediaUrl can process it.
    // For legacy Strapi, return the URL string.
    image: person.image || person.attributes?.image?.data?.attributes?.url || '',
  };
};

/**
 * Get a Sanity image URL string from an image object.
 * Convenience wrapper for components that need a plain URL string.
 */
export const getSanityImageUrl = (imageObj: any, width?: number): string => {
  if (!imageObj) return '';
  if (typeof imageObj === 'string') return imageObj;
  let img = urlFor(imageObj).auto('format').quality(80);
  if (width) img = img.width(width);
  return img.url();
};
