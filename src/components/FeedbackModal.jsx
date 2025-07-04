import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';
import apiService from '../services/api';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }

    if (!formData.body.trim()) {
      setError('Message is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Send feedback email
      const response = await apiService.sendFeedback({
        subject: formData.subject.trim(),
        body: formData.body.trim(),
      });

      if (response.success) {
        toast({
          title: 'Feedback Sent!',
          description: 'Thank you for your feedback. We\'ll get back to you soon.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Reset form and close modal
        setFormData({ subject: '', body: '' });
        onClose();
      } else {
        throw new Error(response.message || 'Failed to send feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      setError(error.message || 'Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ subject: '', body: '' });
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent bg={bgColor} border="1px" borderColor={borderColor}>
        <ModalHeader color={textColor}>Send Feedback</ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel color={textColor}>Subject</FormLabel>
                <Input
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Brief description of your feedback"
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'blue.500' }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Message</FormLabel>
                <Textarea
                  value={formData.body}
                  onChange={(e) => handleInputChange('body', e.target.value)}
                  placeholder="Please describe your feedback, suggestion, or issue in detail..."
                  rows={6}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'blue.500' }}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={handleClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Sending..."
              isDisabled={!formData.subject.trim() || !formData.body.trim()}
            >
              Send Feedback
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default FeedbackModal;
