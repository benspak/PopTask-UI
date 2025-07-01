import React from 'react';
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Tag,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Image,
  Collapse,
  Spinner,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

const DetailPanel = (props) => {
  // All props are passed from App.jsx to keep the UI and logic identical
  // Destructure as needed for clarity
  return (
    props.isDetailOpen && (
      <Box
        w={{ base: '100%', md: props.isCenterOpen ? '350px' : '500px' }}
        bg={props.colorMode === 'light' ? 'white' : 'gray.800'}
        p={6}
        position={{ base: 'fixed', md: 'relative' }}
        top={{ base: '60px', md: 'auto' }}
        left={{ base: 0, md: 'auto' }}
        right={{ base: 0, md: 'auto' }}
        bottom={{ base: 0, md: 'auto' }}
        zIndex={{ base: 70, md: 'auto' }}
        overflowY={{ base: 'auto', md: 'visible' }}
        boxShadow={{ base: 'lg', md: 'none' }}
      >
        {/* The entire detail panel JSX from App.jsx goes here, using props for all state and handlers */}
        {props.children}
      </Box>
    )
  );
};

export default DetailPanel;
