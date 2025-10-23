// src/utils/xmlMapper.js

/* Helpers */
function first (val) { return Array.isArray(val) ? val[0] : val; }
function get (obj, pathArr, fallback = null) {
  try {
    let cur = obj;
    for (const p of pathArr) {
      if (cur == null) return fallback;
      cur = cur[p];
    }
    return cur ?? fallback;
  } catch { return fallback; }
}
function maskAccount (num) {
  if (!num) return { masked: null, last4: null };
  const s = String(num).replace(/\s+/g, '');
  const last4 = s.slice(-4);
  return { masked: s.length > 4 ? 'XXXX-XXXX-XXXX-' + last4 : 'XXXX-' + last4, last4 };
}

/** ===================== INDIAN BUREAU (INProfileResponse) ===================== **/

// Bureau Account_Type codes (common CIBIL style — adjust as needed)
const ACCOUNT_TYPE_MAP_IN = {
  // 10 = Credit Card (R: revolving)
  '10': { type: 'CREDIT_CARD', secured: false },
  // 51/52 often unsecured personal loans (I: installment)
  '51': { type: 'PERSONAL_LOAN', secured: false },
  '52': { type: 'PERSONAL_LOAN', secured: false },
  // fallbacks handled later
};

function parseDateYMD (yyyymmdd) {
  if (!yyyymmdd || String(yyyymmdd).length < 8) return null;
  const s = String(yyyymmdd);
  const y = s.slice(0, 4), m = s.slice(4, 6), d = s.slice(6, 8);
  const dt = new Date(`${y}-${m}-${d}T00:00:00Z`);
  return isNaN(dt) ? null : dt;
}
function parseDateTimeYMDHMS (yyyymmdd, hhmmss) {
  const d = parseDateYMD(yyyymmdd);
  if (!d) return null;
  const hh = String(hhmmss || '').slice(0, 2) || '00';
  const mm = String(hhmmss || '').slice(2, 4) || '00';
  const ss = String(hhmmss || '').slice(4, 6) || '00';
  const iso = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}T${hh}:${mm}:${ss}Z`;
  const dt = new Date(iso);
  return isNaN(dt) ? null : dt;
}

function normalizeINAccount(accNode) {
  const bank = (get(accNode, ['Subscriber_Name'], '') || '').toString().trim();
  const accountNumber = get(accNode, ['Account_Number'], null);
  const { masked, last4 } = maskAccount(accountNumber);
  const code = (get(accNode, ['Account_Type'], '') || '').toString().trim();
  const mapped = ACCOUNT_TYPE_MAP_IN[code] || { type: code || 'OTHER', secured: false };

  // Address (non-normalized lines)
  const addr = get(accNode, ['CAIS_Holder_Address_Details'], null);
  const address = addr ? {
    line1: first(get(addr, ['First_Line_Of_Address_non_normalized'], null)),
    line2: first(get(addr, ['Second_Line_Of_Address_non_normalized'], null)),
    city: first(get(addr, ['City_non_normalized'], null)),
    state: first(get(addr, ['State_non_normalized'], null)),
    pincode: first(get(addr, ['ZIP_Postal_Code_non_normalized'], null))
  } : null;

  const overdue = Number(get(accNode, ['Amount_Past_Due'], 0)) || 0;
  const balance = Number(get(accNode, ['Current_Balance'], 0)) || 0;

  // Rough status mapping from Account_Status codes (commonly: 11 active, 13 closed, 53 written-off, 71 delinquent, etc.)
  const statusCode = (get(accNode, ['Account_Status'], '') || '').toString().trim();
  let status = 'UNKNOWN';
  if (['11','71','0','01'].includes(statusCode)) status = 'OPEN';
  if (['13'].includes(statusCode)) status = 'CLOSED';
  if (['53'].includes(statusCode)) status = 'WRITTEN_OFF';

  return {
    type: mapped.type,
    bank,
    accountNumberMasked: masked,
    rawLast4: last4,
    addresses: address ? [address] : [],
    amountOverdue: overdue,
    currentBalance: balance,
    status,
    secured: mapped.secured
  };
}

function mapINProfileResponse(root) {
  // Header and Profile Header
  const hdr = get(root, ['Header'], {});
  const prof = get(root, ['CreditProfileHeader'], {});
  const reportDate = get(prof, ['ReportDate'], get(hdr, ['ReportDate'], null));
  const reportTime = get(prof, ['ReportTime'], get(hdr, ['ReportTime'], null));
  const generatedAt = parseDateTimeYMDHMS(reportDate, reportTime);
  const reference = get(prof, ['ReportNumber'], null);

  // Applicant basics (Current_Application) — name/phone may live here
  const curr = get(root, ['Current_Application','Current_Application_Details'], {});
  const cad = get(curr, ['Current_Applicant_Details'], {});
  const firstName = get(cad, ['First_Name'], null);
  const lastName = get(cad, ['Last_Name'], null);
  const name = [firstName, lastName].filter(Boolean).join(' ').trim() || null;
  const mobile1 = get(cad, ['MobilePhoneNumber'], null);

  // PAN appears reliably under CAIS_Holder_ID_Details / Income_TAX_PAN
  // there can be multiple CAIS_Account_DETAILS sections — we’ll search for first non-empty PAN
  let pan = null;
  const allAcc = get(root, ['CAIS_Account','CAIS_Account_DETAILS'], []);
  const accArray = Array.isArray(allAcc) ? allAcc : [allAcc].filter(Boolean);
  for (const acc of accArray) {
    const ids = get(acc, ['CAIS_Holder_ID_Details'], []);
    const idsArr = Array.isArray(ids) ? ids : [ids].filter(Boolean);
    for (const id of idsArr) {
      const p = (get(id, ['Income_TAX_PAN'], '') || '').toString().trim();
      if (p) { pan = p; break; }
    }
    if (pan) break;
  }

  // Fallback mobile (holder phone details)
  let mobile = mobile1;
  if (!mobile) {
    for (const acc of accArray) {
      const phone = get(acc, ['CAIS_Holder_Phone_Details','Telephone_Number'], null);
      if (phone) { mobile = phone; break; }
    }
  }

  // Score
  const score = Number(get(root, ['SCORE','BureauScore'], null));
  const creditScore = isNaN(score) ? null : score;

  // Summary
  const sum = get(root, ['CAIS_Account','CAIS_Summary'], {});
  const ca = get(sum, ['Credit_Account'], {});
  const totalAccounts = Number(get(ca, ['CreditAccountTotal'], 0)) || 0;
  const activeAccounts = Number(get(ca, ['CreditAccountActive'], 0)) || 0;
  const closedAccounts = Number(get(ca, ['CreditAccountClosed'], 0)) || 0;

  const totOut = get(sum, ['Total_Outstanding_Balance'], {});
  const securedAmount = Number(get(totOut, ['Outstanding_Balance_Secured'], 0)) || 0;
  const unsecuredAmount = Number(get(totOut, ['Outstanding_Balance_UnSecured'], 0)) || 0;
  const currentBalanceAmount = Number(get(totOut, ['Outstanding_Balance_All'], securedAmount + unsecuredAmount)) || 0;

  // Enquiries last 7 days — prefer TotalCAPS_Summary, fallback to CAPS/CAPS_Summary
  let last7DaysCreditEnquiries =
    Number(get(root, ['TotalCAPS_Summary','TotalCAPSLast7Days'], null));
  if (isNaN(last7DaysCreditEnquiries) || last7DaysCreditEnquiries == null) {
    last7DaysCreditEnquiries = Number(get(root, ['CAPS','CAPS_Summary','CAPSLast7Days'], 0)) || 0;
  }

  // Accounts
  const accounts = accArray.map(normalizeINAccount);

  return {
    reference,
    generatedAt,
    basic: {
      name,
      mobilePhone: mobile || null,
      pan: pan || null,
      creditScore
    },
    summary: {
      totalAccounts,
      activeAccounts,
      closedAccounts,
      currentBalanceAmount,
      securedAmount,
      unsecuredAmount,
      last7DaysCreditEnquiries: Number(last7DaysCreditEnquiries) || 0
    },
    accounts
  };
}

/** ===================== GENERIC (CreditReport / Report) ===================== **/

function normalizeGenericAccountType(raw) {
  const r = (raw || '').toString().toLowerCase();
  if (r.includes('card')) return 'CREDIT_CARD';
  if (r.includes('auto')) return 'AUTO_LOAN';
  if (r.includes('home') || r.includes('mortgage')) return 'HOME_LOAN';
  if (r.includes('personal')) return 'PERSONAL_LOAN';
  return raw || 'OTHER';
}

function mapGeneric(root) {
  const applicant = get(root, ['Applicant'], {});
  const name = get(applicant, ['Name','FullName'], get(root, ['Name'], null));
  const mobile = get(applicant, ['Contacts','Mobile'], get(root, ['MobilePhone'], null));
  const pan = get(applicant, ['Identifiers','PAN'], get(root, ['PAN'], null));
  const creditScore = get(root, ['Scores','Score'], get(root, ['CreditScore','Value'], null));
  const scoreVal = typeof creditScore === 'object' ? creditScore?.Value ?? creditScore?._text ?? null : creditScore;

  const generatedAt = get(root, ['GeneratedOn'], null) ? new Date(get(root, ['GeneratedOn'])) : null;
  const reference = get(root, ['ReferenceNumber'], null);

  const summary = get(root, ['Accounts','Summary'], {});
  const totalAccounts = Number(get(summary, ['Total'], 0));
  const activeAccounts = Number(get(summary, ['Active'], 0));
  const closedAccounts = Number(get(summary, ['Closed'], 0));

  let accounts = get(root, ['Accounts','Account'], []);
  if (!Array.isArray(accounts)) accounts = [accounts].filter(Boolean);
  const normAccounts = accounts.map(acc => {
    const type = normalizeGenericAccountType(get(acc, ['AccountType'], 'OTHER'));
    const bank = get(acc, ['BankName'], get(acc, ['FinancialInstitution'], null));
    const accountNumber = get(acc, ['AccountNumber'], null);
    const { masked, last4 } = maskAccount(accountNumber);
    let addresses = get(acc, ['Addresses','Address'], []);
    if (!Array.isArray(addresses)) addresses = [addresses].filter(Boolean);
    const addrNorm = addresses.map(a => ({
      line1: first(get(a, ['Line1'], null)),
      line2: first(get(a, ['Line2'], null)),
      city: first(get(a, ['City'], null)),
      state: first(get(a, ['State'], null)),
      pincode: first(get(a, ['Pincode'], null))
    }));
    const amountOverdue = Number(get(acc, ['AmountOverdue'], 0));
    const currentBalance = Number(get(acc, ['CurrentBalance'], 0));
    const status = get(acc, ['Status'], null);
    const rawSec = get(acc, ['SecuredFlag'], null);
    const secured = rawSec != null ? String(rawSec).toLowerCase() === 'true' : ['AUTO_LOAN','HOME_LOAN'].includes(type);
    return {
      type, bank,
      accountNumberMasked: masked,
      rawLast4: last4,
      addresses: addrNorm,
      amountOverdue,
      currentBalance,
      status,
      secured
    };
  });

  const currentBalanceAmount = normAccounts.reduce((s, a) => s + (a.currentBalance || 0), 0);
  const securedAmount = normAccounts.filter(a => a.secured).reduce((s, a) => s + (a.currentBalance || 0), 0);
  const unsecuredAmount = currentBalanceAmount - securedAmount;

  let enquiries = get(root, ['Enquiries','Enquiry'], []);
  if (!Array.isArray(enquiries)) enquiries = [enquiries].filter(Boolean);
  const now = new Date();
  const last7DaysCreditEnquiries = enquiries.filter(e => {
    const d = new Date(get(e, ['Date'], '1970-01-01'));
    return (now - d) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  return {
    reference,
    generatedAt,
    basic: {
      name: name ?? null,
      mobilePhone: mobile ?? null,
      pan: pan ?? null,
      creditScore: scoreVal != null ? Number(scoreVal) : null
    },
    summary: {
      totalAccounts,
      activeAccounts,
      closedAccounts,
      currentBalanceAmount,
      securedAmount,
      unsecuredAmount,
      last7DaysCreditEnquiries
    },
    accounts: normAccounts
  };
}

/** ===================== ENTRY ===================== **/

export function mapXmlToReport (xml) {
  // Route by known roots
  if (xml?.INProfileResponse) {
    return mapINProfileResponse(xml.INProfileResponse);
  }
  const root = xml.CreditReport || xml.Report || xml;
  return mapGeneric(root);
}
