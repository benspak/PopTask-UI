import React from 'react';
import { Box } from '@chakra-ui/react';

export default function MobileBackdropOverlay({
  isSidebarOpen,
  isCenterOpen,
  isDetailOpen,
  isFooterOpen,
  toggleSidebar,
  toggleCenter,
  toggleDetail,
}) {
  // Only show if any panel is open
  if (!(isSidebarOpen || isCenterOpen || isDetailOpen || (isFooterOpen && !(isSidebarOpen || isCenterOpen || isDetailOpen)))) {
    return null;
  }
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.300"
      zIndex={50}
      display={{ base: 'block', md: 'none' }}
      onClick={() => {
        // Only close panels if not just the prompt popover
        if (isFooterOpen && !(isSidebarOpen || isCenterOpen || isDetailOpen)) {
          // Do nothing, prompt popover should only close via ESC or X
          return;
        }
        if (isSidebarOpen) toggleSidebar();
        if (isCenterOpen) toggleCenter();
        if (isDetailOpen) toggleDetail();
      }}
    />
  );
}
