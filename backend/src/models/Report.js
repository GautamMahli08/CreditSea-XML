import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  line1: String,
  line2: String,
  city: String,
  state: String,
  pincode: String
}, { _id: false });

const AccountSchema = new mongoose.Schema({
  type: { type: String, index: true }, // CREDIT_CARD, AUTO_LOAN, etc.
  bank: { type: String, index: true },
  accountNumberMasked: String,
  rawLast4: String,
  addresses: [AddressSchema],
  amountOverdue: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  secured: { type: Boolean, default: false, index: true },
  status: { type: String, index: true }
}, { _id: false });

const BasicSchema = new mongoose.Schema({
  name: { type: String, index: true },
  mobilePhone: String,
  pan: { type: String, index: true },
  creditScore: Number
}, { _id: false });

const SummarySchema = new mongoose.Schema({
  totalAccounts: Number,
  activeAccounts: Number,
  closedAccounts: Number,
  currentBalanceAmount: Number,
  securedAmount: Number,
  unsecuredAmount: Number,
  last7DaysCreditEnquiries: Number
}, { _id: false });

const ReportSchema = new mongoose.Schema({
  reference: { type: String, index: true, sparse: true },
  generatedAt: Date,
  basic: BasicSchema,
  summary: SummarySchema,
  accounts: [AccountSchema]
}, { timestamps: true });

ReportSchema.index({ 'basic.pan': 1, generatedAt: -1 });

export const Report = mongoose.model('Report', ReportSchema);
