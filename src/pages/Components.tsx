import React, { useState } from 'react';
import { useToast } from '../components/ToastContainer';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';

const Components: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleShowToast = (type: 'success' | 'error' | 'info' | 'warning') => {
    showToast({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      message: `This is a ${type} message example`
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Component Library</h1>
          <p className="text-lg text-gray-600">Testing and showcasing our UI components</p>
        </div>

        {/* Buttons */}
        <Card>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Buttons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="ghost">Ghost</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Card>

        {/* Badges */}
        <Card>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </div>
        </Card>

        {/* Form Fields */}
        <Card>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Form Fields</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              placeholder="Enter your name"
              required
            />
            
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="Enter your email"
              required
            />
            
            <FormField
              label="Message"
              name="message"
              type="textarea"
              value={formData.message}
              onChange={handleInputChange}
              error={errors.message}
              placeholder="Enter your message"
              className="md:col-span-2"
            />
          </div>
        </Card>

        {/* Loading Spinners */}
        <Card>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Loading Spinners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <LoadingSpinner size="sm" />
              <p className="text-sm text-gray-600 mt-2">Small</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="md" />
              <p className="text-sm text-gray-600 mt-2">Medium</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-600 mt-2">Large</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="xl" />
              <p className="text-sm text-gray-600 mt-2">Extra Large</p>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-8">
            <div className="text-center">
              <LoadingSpinner variant="primary" text="Loading..." />
            </div>
            <div className="text-center">
              <LoadingSpinner variant="white" text="Processing..." />
            </div>
            <div className="text-center">
              <LoadingSpinner variant="gray" text="Please wait..." />
            </div>
          </div>
        </Card>

        {/* Toast Examples */}
        <Card>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Toast Notifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="success" onClick={() => handleShowToast('success')}>
              Success Toast
            </Button>
            <Button variant="danger" onClick={() => handleShowToast('error')}>
              Error Toast
            </Button>
            <Button variant="info" onClick={() => handleShowToast('info')}>
              Info Toast
            </Button>
            <Button variant="warning" onClick={() => handleShowToast('warning')}>
              Warning Toast
            </Button>
          </div>
        </Card>

        {/* Cards */}
        <Card>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card padding="sm" shadow="sm">
              <h3 className="font-semibold text-gray-900 mb-2">Small Padding, Small Shadow</h3>
              <p className="text-gray-600">This card has minimal padding and shadow.</p>
            </Card>
            
            <Card padding="md" shadow="md" border>
              <h3 className="font-semibold text-gray-900 mb-2">Medium Padding, Medium Shadow, Border</h3>
              <p className="text-gray-600">This card has medium padding, shadow, and a border.</p>
            </Card>
            
            <Card padding="lg" shadow="lg">
              <h3 className="font-semibold text-gray-900 mb-2">Large Padding, Large Shadow</h3>
              <p className="text-gray-600">This card has generous padding and shadow.</p>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Components;
