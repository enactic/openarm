import React, {
  type ReactNode
} from 'react';

interface ComponentPhotoProps {
  src: string;
  alt: string;
}

export default function ComponentPhoto({ src, alt }: ComponentPhotoProps): ReactNode {
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '10em', height: '10em', objectFit: 'contain' }}
    />
  );
}
