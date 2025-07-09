import React, { useState } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Box,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

const DismissibleAlert = ({
  status = 'error',
  title,
  description,
  onDismiss,
  mb = 4,
  borderRadius = 'md',
  size = 'md',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Alert status={status} mb={mb} borderRadius={borderRadius} size={size}>
      <AlertIcon />
      <Box flex="1">
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{description}</AlertDescription>
      </Box>
      <Button
        size="xs"
        variant="ghost"
        onClick={handleDismiss}
        color="gray.500"
        _hover={{ color: "gray.700" }}
        aria-label="Dismiss alert"
      >
        <CloseIcon />
      </Button>
    </Alert>
  );
};

export default DismissibleAlert;
