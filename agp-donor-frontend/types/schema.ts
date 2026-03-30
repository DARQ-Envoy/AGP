import z from 'zod'

// ============================================================================
// ENUMS
// ============================================================================

// ============================================================================
// CONTACT SCHEMAS
// ============================================================================

/**
 * Contact Create Schema
 * Schema for creating new contacts
 */
export const createContactFormSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(11, 'Phone number must be 11 digits')
    .max(14, 'Phone number must be maximum 14 digits'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  inquiryType: z.enum(['CONTACT', 'INQUIRY']),
})

// ============================================================================
// CUSTOMER SCHEMAS
// ============================================================================

export const createCustomerFormSchema = z.object({
  // Required base fields
  companyId: z.string().min(1, 'Company is required'),
  code: z.string().min(1, 'Customer code is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),

  // Billing Address
  billingAddress: z.string().optional().or(z.literal('')),
  billingCity: z.string().optional().or(z.literal('')),
  billingState: z.string().optional().or(z.literal('')),
  billingCountry: z.string().optional().or(z.literal('')),
  billingPostalCode: z.string().optional().or(z.literal('')),

  // Shipping Address
  shippingAddress: z.string().optional().or(z.literal('')),
  shippingCity: z.string().optional().or(z.literal('')),
  shippingState: z.string().optional().or(z.literal('')),
  shippingCountry: z.string().optional().or(z.literal('')),
  shippingPostalCode: z.string().optional().or(z.literal('')),

  // Business Info
  taxNumber: z.string().optional().or(z.literal('')),
  vatNumber: z.string().optional().or(z.literal('')),
  creditLimit: z.coerce.number().optional(),
  currency: z.string().default('EUR'),

  isActive: z.boolean().default(true),
  notes: z.string().optional().or(z.literal('')),
})

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
//
// ============================================================================
// COMPANY SCHEMAS
// ============================================================================

/**
 * Company Create Schema
 * Schema for creating new companies
 */
export const createCompanyFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, 'Company name is required'),
  displayName: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),

  // Address
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  country: z.string().default('Germany'),
  postalCode: z.string().optional().or(z.literal('')),

  // Legal & Tax
  taxNumber: z.string().optional().or(z.literal('')),
  vatNumber: z.string().optional().or(z.literal('')),
  registrationNumber: z.string().optional().or(z.literal('')),
  legalForm: z.string().optional().or(z.literal('')),

  // Locale & Currency
  baseCurrency: z.string().default('EUR'),
  timezone: z.string().default('Europe/Berlin'),
  language: z.string().default('de'),

  // Financial Year
  financialYearStart: z.coerce
    .date()
    .default(new Date('2025-01-01T00:00:00.000Z')),
  financialYearEnd: z.coerce
    .date()
    .default(new Date('2025-12-31T23:59:59.999Z')),

  // Settings
  isActive: z.boolean().default(true),
  // settings: keep for future advanced JSON config; omitted from basic form
})

export type CreateCompanyFormData = z.infer<typeof createCompanyFormSchema>
export type UpdateCompanyFormData = z.infer<typeof createCompanyFormSchema>

// ============================================================================
// SUPPLIER SCHEMAS
// ============================================================================

export const createSupplierFormSchema = z.object({
  // Required
  name: z.string().min(1, 'Supplier name is required'),
  companyId: z.string().min(1, 'Company is required'),

  // Contact
  contactPerson: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),

  // Address
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),

  // Business Info
  taxNumber: z.string().optional().or(z.literal('')),
  vatNumber: z.string().optional().or(z.literal('')),
  bankAccount: z.string().optional().or(z.literal('')),
  bankName: z.string().optional().or(z.literal('')),

  // Terms & Conditions
  paymentTerms: z.coerce.number().int().optional(),
  creditLimit: z.coerce.number().optional(),
  currency: z.string().default('EUR'),

  // Status
  status: z
    .enum(['PENDING_APPROVAL', 'ACTIVE', 'INACTIVE'])
    .default('PENDING_APPROVAL'),
  notes: z.string().optional().or(z.literal('')),
})

export type CreateSupplierFormData = z.infer<typeof createSupplierFormSchema>
export type UpdateSupplierFormData = z.infer<typeof createSupplierFormSchema>

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

export const createProductFormSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Product name is required'),
  companyId: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  categoryId: z.string().optional().or(z.literal('')),

  // Pricing
  basePrice: z.coerce.number().min(0, 'Base price is required'),
  salePrice: z.coerce.number().optional().or(z.literal(0)),
  costPrice: z.coerce.number().optional().or(z.literal(0)),
  currency: z.string().default('EUR'),

  // Physical Properties
  weight: z.coerce.number().optional().or(z.literal(0)),
  dimensions: z.string().optional().or(z.literal('')),
  color: z.string().optional().or(z.literal('')),
  size: z.string().optional().or(z.literal('')),

  // Inventory
  stockQuantity: z.coerce.number().default(0),
  minStockLevel: z.coerce.number().default(0),
  maxStockLevel: z.coerce.number().optional().or(z.literal(0)),
  reorderPoint: z.coerce.number().optional().or(z.literal(0)),

  // Status & Settings
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).default('ACTIVE'),
  isDropshipping: z.boolean().default(false),
  isTaxable: z.boolean().default(true),

  // SEO & Marketing
  images: z.array(z.string()).default([]),
  tags: z.string().optional().or(z.array(z.string())),
  metaTitle: z.string().optional().or(z.literal('')),
  metaDescription: z.string().optional().or(z.literal('')),

  // Expiry
  expiredDate: z.coerce.date().nullable().optional(),
})

export type CreateProductFormData = z.infer<typeof createProductFormSchema>
export type UpdateProductFormData = z.infer<typeof createProductFormSchema>

// File upload validation helper
const validateFileType = (file: File) => {
  const allowedTypes = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ]

  const allowedExtensions = ['.csv', '.xlsx', '.xls']
  const hasValidMimeType = allowedTypes.includes(file.type)
  const hasValidExtension = allowedExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  )

  return hasValidMimeType || hasValidExtension
}

const validateFileSize = (file: File) => {
  const maxSize = 50 * 1024 * 1024 // 50MB limit
  return file.size <= maxSize
}

export const importProductFormSchema = z.object({
  file: z
    .instanceof(File)
    .refine(validateFileType, {
      message: 'Only CSV and Excel files (.csv, .xlsx, .xls) are allowed',
    })
    .refine(validateFileSize, {
      message: 'File size must be less than 50MB',
    }),
})

export type ImportProductFormData = z.infer<typeof importProductFormSchema>

// Generic file upload schema for any import
export const importFileFormSchema = z.object({
  file: z
    .instanceof(File)
    .refine(validateFileType, {
      message: 'Only CSV and Excel files (.csv, .xlsx, .xls) are allowed',
    })
    .refine(validateFileSize, {
      message: 'File size must be less than 50MB',
    }),
})

export type ImportFileFormData = z.infer<typeof importFileFormSchema>

// CSV only schema (for stricter validation)
export const importCSVFormSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) =>
        file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv'),
      {
        message: 'File must be a CSV file',
      }
    )
    .refine(validateFileSize, {
      message: 'File size must be less than 50MB',
    }),
})

export type ImportCSVFormData = z.infer<typeof importCSVFormSchema>

// Excel only schema
export const importExcelFormSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => {
        const excelTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel', // .xls
        ]
        const excelExtensions = ['.xlsx', '.xls']
        const hasValidMimeType = excelTypes.includes(file.type)
        const hasValidExtension = excelExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        )
        return hasValidMimeType || hasValidExtension
      },
      {
        message: 'File must be an Excel file (.xlsx or .xls)',
      }
    )
    .refine(validateFileSize, {
      message: 'File size must be less than 50MB',
    }),
})

export const importLogFormSchema = z.object({
  file: z
    .instanceof(File)
    .refine(validateFileType, {
      message: 'Only CSV and Excel files (.csv, .xlsx, .xls) are allowed',
    })
    .refine(validateFileSize, {
      message: 'File size must be less than 50MB',
    }),
})

export type ImportLogFormData = z.infer<typeof importLogFormSchema>

export type ImportExcelFormData = z.infer<typeof importExcelFormSchema>

// Specific import schemas for different entities
export const importCustomerFormSchema = importFileFormSchema
export type ImportCustomerFormData = z.infer<typeof importCustomerFormSchema>

export const importSupplierFormSchema = importFileFormSchema
export type ImportSupplierFormData = z.infer<typeof importSupplierFormSchema>

export const importInventoryFormSchema = z.object({
  csvFile: z
    .instanceof(File)
    .refine(validateFileType, {
      message: 'Only CSV and Excel files (.csv, .xlsx, .xls) are allowed',
    })
    .refine(validateFileSize, {
      message: 'File size must be less than 50MB',
    }),
})
export type ImportInventoryFormData = z.infer<typeof importInventoryFormSchema>

export const importOrderFormSchema = importFileFormSchema
export type ImportOrderFormData = z.infer<typeof importOrderFormSchema>

// ============================================================================
// CATEGORY SCHEMAS
// ============================================================================

export const createCategoryFormSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional().or(z.literal('')),
  parentId: z.string().optional().or(z.literal('')),

  // Status
  isActive: z.boolean().default(true),
})

export type CreateCategoryFormData = z.infer<typeof createCategoryFormSchema>
export type UpdateCategoryFormData = z.infer<typeof createCategoryFormSchema>

// ============================================================================
// SHIFT SCHEMAS
// ============================================================================

export const createShiftFormSchema = z.object({
  // Basic Info
  shiftName: z.string().min(1, 'Shift name is required'),

  // Timing
  startTime: z.coerce.date().optional().or(z.literal('')),
  endTime: z.coerce.date().optional().or(z.literal('')),
})

export type CreateShiftFormData = z.infer<typeof createShiftFormSchema>
export type UpdateShiftFormData = z.infer<typeof createShiftFormSchema>
// ============================================================================
// USER SCHEMAS
// ============================================================================

export const createUserFormSchema = z.object({
  // Basic info
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional().or(z.literal('')),
  companyId: z.string().optional().or(z.literal('')),
  type: z.string().default('EMPLOYEE'),

  // Authentication
  allowLogin: z.boolean().default(false),
  userName: z.string().optional().or(z.literal('')),
  roleId: z.string().min(1, 'Role is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),

  // Sales permissions
  salesCommissionPercent: z.coerce.number().default(0),
  maxSalesDiscountPercent: z.coerce.number().default(0),

  // Banking info
  currency: z.string().optional().or(z.literal('')),
  bankAccHolderName: z.string().optional().or(z.literal('')),
  bankAccNo: z.string().optional().or(z.literal('')),
  bankName: z.string().optional().or(z.literal('')),
  bankIdentifierCode: z.string().optional().or(z.literal('')),
  bankBranch: z.string().optional().or(z.literal('')),
  taxPayerId: z.string().optional().or(z.literal('')),

  // Personal info
  nidNumber: z.string().optional().or(z.literal('')),
  dateOfBirth: z.coerce.date().optional(),
  facebookLink: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  xLink: z.string().optional().or(z.literal('')),
  bloodGroup: z.string().optional().or(z.literal('')),
  instagramLink: z.string().optional().or(z.literal('')),
  maritalStatus: z.string().optional().or(z.literal('')),
  guardianName: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  permanentAddress: z.string().optional().or(z.literal('')),
  currentAddress: z.string().optional().or(z.literal('')),
  photo: z.string().optional().or(z.literal('')),
  language: z.string().optional().or(z.literal('')),

  // HR info
  empId: z.string().optional().or(z.literal('')),
  shiftId: z.string().optional().or(z.literal('')),
  departmentId: z.string().optional().or(z.literal('')),
  designationId: z.string().optional().or(z.literal('')),
  salary: z.coerce.number().optional(),
  salaryType: z.string().optional().or(z.literal('')),

  // Security
  mfaEnabled: z.boolean().default(false),
})

export type CreateUserFormData = z.infer<typeof createUserFormSchema>
export type UpDateUserFormData = z.infer<typeof createUserFormSchema>

// ============================================================================
// DESIGNATION SCHEMAS
// ============================================================================

export const createDesignationFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, 'Designation name is required'),
  departmentId: z.string().optional().or(z.literal('')),
})

export type CreateDesignationFormData = z.infer<
  typeof createDesignationFormSchema
>
export type UpdateDesignationFormData = z.infer<
  typeof createDesignationFormSchema
>

// ============================================================================
// DEPARTMENT SCHEMAS
// ============================================================================

export const createDepartmentFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, 'Department name is required'),
})

export type CreateDepartmentFormData = z.infer<
  typeof createDepartmentFormSchema
>
export type UpdateDepartmentFormData = z.infer<
  typeof createDepartmentFormSchema
>

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

export const createSalesOrderFormSchema = z.object({
  // Basic Info
  companyId: z.string().min(1, 'Company is required'),
  customerId: z.string().optional().or(z.literal('')),
  orderNumber: z.string().min(1, 'Order number is required'),

  // Order Details
  orderDate: z.coerce.date().default(new Date()),
  requiredDate: z.coerce.date().optional(),
  shippedDate: z.coerce.date().optional(),
  deliveredDate: z.coerce.date().optional(),

  // Amounts
  subtotal: z.coerce
    .number()
    .min(0, 'Subtotal must be non-negative')
    .default(0),
  taxAmount: z.coerce
    .number()
    .min(0, 'Tax amount must be non-negative')
    .default(0),
  shippingAmount: z.coerce
    .number()
    .min(0, 'Shipping amount must be non-negative')
    .default(0),
  discountAmount: z.coerce
    .number()
    .min(0, 'Discount amount must be non-negative')
    .default(0),
  totalAmount: z.coerce
    .number()
    .min(0, 'Total amount must be non-negative')
    .default(0),
  currency: z.string().default('EUR'),

  // Shipping Info
  shippingAddress: z.string().optional().or(z.literal('')),
  shippingCity: z.string().optional().or(z.literal('')),
  shippingState: z.string().optional().or(z.literal('')),
  shippingCountry: z.string().optional().or(z.literal('')),
  shippingPostalCode: z.string().optional().or(z.literal('')),
  trackingNumber: z.string().optional().or(z.literal('')),
  shippingMethod: z.string().optional().or(z.literal('')),

  // Status & Settings
  status: z
    .enum([
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'RETURNED',
    ])
    .default('PENDING'),
  paymentStatus: z
    .enum(['PENDING', 'PAID', 'PARTIAL', 'REFUNDED', 'FAILED'])
    .default('PENDING'),
  isDropshipping: z.boolean().default(false),

  // Marketplace info
  marketplaceOrderId: z.string().optional().or(z.literal('')),
  marketplaceType: z
    .enum(['AMAZON', 'EBAY', 'SHOPIFY', 'WOOCOMMERCE', 'OTHER'])
    .optional(),

  notes: z.string().optional().or(z.literal('')),
  internalNotes: z.string().optional().or(z.literal('')),
})

export const createSalesOrderItemFormSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0, 'Unit price must be non-negative'),
  discount: z.coerce
    .number()
    .min(0, 'Discount must be non-negative')
    .default(0),
  taxRate: z.coerce.number().min(0, 'Tax rate must be non-negative').default(0),
  totalAmount: z.coerce.number().min(0, 'Total amount must be non-negative'),

  // Dropshipping
  supplierId: z.string().optional().or(z.literal('')),
  supplierOrderNumber: z.string().optional().or(z.literal('')),
  supplierStatus: z.string().optional().or(z.literal('')),

  notes: z.string().optional().or(z.literal('')),
})

export type CreateSalesOrderFormData = z.infer<
  typeof createSalesOrderFormSchema
>
export type UpdateSalesOrderFormData = z.infer<
  typeof createSalesOrderFormSchema
>
export type CreateSalesOrderItemFormData = z.infer<
  typeof createSalesOrderItemFormSchema
>
export type UpdateSalesOrderItemFormData = z.infer<
  typeof createSalesOrderItemFormSchema
>

// Order Status and Payment Status enums for TypeScript
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum MarketplaceType {
  AMAZON = 'AMAZON',
  EBAY = 'EBAY',
  SHOPIFY = 'SHOPIFY',
  WOOCOMMERCE = 'WOOCOMMERCE',
  OTHER = 'OTHER',
}
// PURCHASE ORDER SCHEMAS
// ============================================================================

export const createPurchaseOrderFormSchema = z.object({
  // Basic Info
  poNumber: z.string().min(1, 'PO Number is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  orderId: z.string().optional().or(z.literal('')),

  // Dates
  orderDate: z.coerce.date().default(new Date()),
  expectedDate: z.coerce.date().optional(),
  receivedDate: z.coerce.date().optional(),

  // Amounts
  subtotal: z.coerce.number().min(0, 'Subtotal must be positive').default(0),
  taxAmount: z.coerce.number().min(0, 'Tax amount must be positive').default(0),
  shippingAmount: z.coerce
    .number()
    .min(0, 'Shipping amount must be positive')
    .default(0),
  totalAmount: z.coerce
    .number()
    .min(0, 'Total amount must be positive')
    .default(0),
  currency: z.string().default('EUR'),

  // Delivery Info
  deliveryAddress: z.string().optional().or(z.literal('')),
  deliveryCity: z.string().optional().or(z.literal('')),
  deliveryState: z.string().optional().or(z.literal('')),
  deliveryCountry: z.string().optional().or(z.literal('')),
  deliveryPostalCode: z.string().optional().or(z.literal('')),

  // Status & Settings
  status: z
    .enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    .default('PENDING'),
  isDropshipping: z.boolean().default(false),

  // Additional Info
  notes: z.string().optional().or(z.literal('')),
})

export type CreatePurchaseOrderFormData = z.infer<
  typeof createPurchaseOrderFormSchema
>
export type UpdatePurchaseOrderFormData = z.infer<
  typeof createPurchaseOrderFormSchema
>
