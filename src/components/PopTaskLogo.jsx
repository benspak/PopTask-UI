import React from 'react';
import { Box } from '@chakra-ui/react';

const PopTaskLogo = ({ size = 32, colorMode = 'light' }) => {
  const isDark = colorMode === 'dark';
  const logoSrc = isDark ? '/logos/logo-dark-mode.svg' : '/logos/logo-light-mode.svg';

  return (
    <Box
      as="img"
      src={logoSrc}
      alt="PopTask Logo"
      width={size}
      height={size * 0.24} // Maintain aspect ratio (368/1505 ≈ 0.24)
      objectFit="contain"
    />
  );
};

export default PopTaskLogo;
