import { Button } from '@/components/ui';
import Input from '@/components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { shippingSchema, type ShippingFormData } from './checkoutSchemas';

interface ShippingFormProps {
  defaultValues?: Partial<ShippingFormData>;
  onSubmit: (data: ShippingFormData) => void;
}

/**
 * ShippingForm Component
 *
 * Step 1 of checkout - collects shipping address.
 *
 * Features:
 * - React Hook Form for performance (uncontrolled inputs)
 * - Zod schema validation with custom error messages
 * - Auto-focus on first input
 * - Keyboard navigation friendly
 * - Pre-populated if user returns from later step
 */
const ShippingForm = ({ defaultValues, onSubmit }: ShippingFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Shipping Address
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* First Name */}
        <Input
          label="First Name"
          placeholder="John"
          autoComplete="given-name"
          autoFocus
          required
          error={errors.firstName?.message}
          {...register('firstName')}
        />

        {/* Last Name */}
        <Input
          label="Last Name"
          placeholder="Doe"
          autoComplete="family-name"
          required
          error={errors.lastName?.message}
          {...register('lastName')}
        />

        {/* Email */}
        <Input
          type="email"
          label="Email"
          placeholder="john@example.com"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Phone */}
        <Input
          type="tel"
          label="Phone"
          placeholder="+1 (555) 000-0000"
          autoComplete="tel"
          required
          error={errors.phone?.message}
          {...register('phone')}
        />

        {/* Address */}
        <div className="sm:col-span-2">
          <Input
            label="Street Address"
            placeholder="123 Main St, Apt 4B"
            autoComplete="street-address"
            required
            error={errors.address?.message}
            {...register('address')}
          />
        </div>

        {/* City */}
        <Input
          label="City"
          placeholder="New York"
          autoComplete="address-level2"
          required
          error={errors.city?.message}
          {...register('city')}
        />

        {/* State */}
        <Input
          label="State / Province"
          placeholder="NY"
          autoComplete="address-level1"
          required
          error={errors.state?.message}
          {...register('state')}
        />

        {/* ZIP Code */}
        <Input
          label="ZIP / Postal Code"
          placeholder="10001"
          autoComplete="postal-code"
          required
          error={errors.zipCode?.message}
          {...register('zipCode')}
        />

        {/* Country */}
        <Input
          label="Country"
          placeholder="United States"
          autoComplete="country-name"
          required
          error={errors.country?.message}
          {...register('country')}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit" size="lg" isLoading={isSubmitting}>
          Continue to Payment
        </Button>
      </div>
    </form>
  );
};

export default ShippingForm;
