// List of known temporary, disposable, and burner email domains
const DISPOSABLE_DOMAINS = new Set([
  // Popular temp mail providers
  "tempmail.com", "temp-mail.org", "temp-mail.io", "tempmail.net", "tempmailo.com",
  "10minutemail.com", "10minutemail.net", "10minutemail.org", "10minmail.com",
  "guerrillamail.com", "guerrillamail.info", "guerrillamail.biz", "guerrillamail.de", "guerrillamail.net", "guerrillamail.org", "grr.la", "pokemail.net",
  "mailinator.com", "mailinator2.com", "sogetthis.com", "mailinater.com",
  "yopmail.com", "yopmail.fr", "yopmail.net", "cool.fr.nf", "jetable.fr.nf", "courriel.fr.nf", "moncourrier.fr.nf", "monemail.fr.nf", "monmail.fr.nf",
  "trashmail.com", "trashmail.net", "trashmail.me", "trashmail.org", "trashmail.at", "trashmail.io",
  "dispostable.com", "getnada.com", "nada.ltd", "nada.pro", "abyssmail.com",
  "fakemailgenerator.com", "armyspy.com", "cuvox.de", "dayrep.com", "einrot.com", "fleckens.hu", "gustr.com", "jourrapide.com", "rhyta.com", "superrito.com", "teleworm.us",
  "sharklasers.com", "guerrillamailblock.com", "spam4.me",
  "throwawaymail.com", "throwaway.email", "mohmal.com", "mohmal.in", "crazymailing.com",
  "generator.email", "inboxalias.com", "disposablemail.com", "burnermail.io", "emailondeck.com",
  "mailnull.com", "spambox.us", "mytemp.email", "incognitomail.com", "minuteinbox.com",
  "maildrop.cc", "ethereal.email", "receive-smss.com", "tempail.com", "disposable.com",
  "tempemail.net", "tempemail.co", "tempmail.app", "tempmail.ninja", "disposable-email.com",
  "tempinbox.com", "dropmail.me", "getairmail.com", "disposable.com", "fakeinbox.com",
  "mailcatch.com", "inboxkitten.com", "mytemp.email", "anonymbox.com", "spambog.com",
  "temp-email.org", "bouncr.com", "filzmail.com", "trashmail.app", "disposableaddresses.com",
  "fastmail.fm", "bugmenot.com", "harakirimail.com", "mailnesia.com", "tempmail.us",
  "disposablemail.org", "tempmail.space", "throwawayemailaddress.com", "tempmail.live"
]);

// Trusted legitimate email domains for fast-track passing
const TRUSTED_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "ymail.com", "rocketmail.com",
  "outlook.com", "hotmail.com", "live.com", "msn.com",
  "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "protonmail.ch",
  "zoho.com", "zohomail.com", "aol.com", "gmx.com", "gmx.net", "mail.com",
  "yandex.com", "yandex.ru", "tutanota.com", "tutamail.com", "fastmail.com"
]);

export interface EmailCheckResult {
  isValid: boolean;
  isDisposable: boolean;
  domain: string;
  messageBn: string;
  messageEn: string;
}

export function checkEmailAddress(email: string): EmailCheckResult {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Basic format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      isValid: false,
      isDisposable: false,
      domain: "",
      messageBn: "অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস লিখুন (যেমন: name@example.com)।",
      messageEn: "Please enter a valid email address (e.g., name@example.com)."
    };
  }

  const parts = cleanEmail.split("@");
  if (parts.length !== 2) {
    return {
      isValid: false,
      isDisposable: false,
      domain: "",
      messageBn: "ইমেইল ফরম্যাট সঠিক নয়।",
      messageEn: "Invalid email format."
    };
  }

  const domain = parts[1];

  // 2. Check if trusted real email provider
  if (TRUSTED_DOMAINS.has(domain)) {
    return {
      isValid: true,
      isDisposable: false,
      domain,
      messageBn: "ইমেইল ভেরিফাইড এবং লগইন সফল হয়েছে!",
      messageEn: "Email verified and login successful!"
    };
  }

  // 3. Check exact disposable domain set
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: true,
      isDisposable: true,
      domain,
      messageBn: "সতর্কতা: টেম্পোরারি বা ফেক ইমেইল ডোমেইন (Temp-Mail) দিয়ে লগইন নিষিদ্ধ! অনুগ্রহ করে জেনুইন ইমেইল (Gmail, Yahoo, Outlook ইত্যাদি) ব্যবহার করুন।",
      messageEn: "Warning: Temporary or disposable email domains (Temp-Mail) are strictly blocked! Please use a genuine email (Gmail, Yahoo, Outlook, etc.)."
    };
  }

  // 4. Heuristic pattern checks for temp mail keywords in domain
  const tempKeywords = [
    "temp", "disposa", "trash", "fake", "burner", "throwaway", "10min",
    "guerrilla", "generator", "mailinator", "yopmail", "mohmal", "anon",
    "expire", "dropmail", "sharklaser", "spambox", "disposable", "pokemail"
  ];

  const hasTempKeyword = tempKeywords.some(keyword => domain.includes(keyword));
  if (hasTempKeyword) {
    return {
      isValid: true,
      isDisposable: true,
      domain,
      messageBn: "সতর্কতা: এটি একটি টেম্পোরারি ইমেইল ডোমেইন বলে মনে হচ্ছে। প্রফেশনাল ইমেইল দিয়ে চেষ্টা করুন।",
      messageEn: "Warning: This appears to be a temporary or burner email domain. Please use a permanent email."
    };
  }

  // 5. Custom enterprise or standard domain
  return {
    isValid: true,
    isDisposable: false,
    domain,
    messageBn: "ইমেইল ভেরিফাইড এবং লগইন সফল হয়েছে!",
    messageEn: "Email verified and login successful!"
  };
}
