import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import countryList from "react-select-country-list";

import API from "@/services";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import Icon from "@/components/ui/Icon";
import Notification from "@/components/ui/Notification";
import Select from "@/components/form/Select";
import StyledFileInput from "@/components/ui/StyledFileInput";
import TextInput from "@/components/form/TextInput";
import PhoneInput from "@/components/form/PhoneInput";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedFileExtensions = ["jpg", "jpeg", "png", "pdf"];

const yesNoOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const financialQuestions = [
  {
    section: "financial_information",
    question_key: "knowledge_of_cfds",
    question_text: "Knowledge of CFDs",
    answer_type: "multiple_choice",
    sort_order: 12,
    options: [
      {
        label: "Finance related education program",
        value: "finance_related_education_program",
      },
      {
        label: "Employment at a Financial Institution",
        value: "employment_at_financial_institution",
      },
      {
        label: "Finance industry qualification",
        value: "finance_industry_qualification",
      },
      {
        label: "Researched information about FX, Securities and/or Commodities markets.",
        value: "researched_fx_securities_commodities",
      },
      {
        label: "I have no knowledge of CFDs",
        value: "no_knowledge_of_cfds",
      },
      { label: "Other", value: "other" },
    ],
  },
  {
    section: "financial_information",
    question_key: "trading_frequency",
    question_text: "Trading Frequency",
    answer_type: "single_choice",
    sort_order: 13,
    options: [
      { label: "None", value: "none" },
      { label: "1-5 times per year", value: "1_5_times_per_year" },
      { label: "6-20 times per year", value: "6_20_times_per_year" },
      { label: "Other", value: "other" },
    ],
  },
  {
    section: "financial_information",
    question_key: "educational_background",
    question_text: "Educational Background",
    answer_type: "single_choice",
    sort_order: 14,
    options: [
      { label: "None", value: "none" },
      { label: "High School", value: "high_school" },
      { label: "Academic", value: "academic" },
      { label: "Post Studies", value: "post_studies" },
      { label: "Other", value: "other" },
    ],
  },
  {
    section: "financial_information",
    question_key: "trading_experience",
    question_text: "Trading Experience",
    answer_type: "multiple_choice",
    sort_order: 15,
    options: [
      { label: "None", value: "none" },
      { label: "Securities", value: "securities" },
      { label: "Options", value: "options" },
      { label: "Futures", value: "futures" },
      { label: "CFDs", value: "cfds" },
      { label: "Commodities", value: "commodities" },
      { label: "Other", value: "other" },
    ],
  },
  {
    section: "financial_information",
    question_key: "relevant_academic_qualification",
    question_text: "Do you hold a diploma/higher level academic qualification in a relevant field?",
    answer_type: "single_choice",
    sort_order: 16,
    options: [
      {
        label: "Yes, Higher level Financial Qualification (eg. ACA, CFA or similar)",
        value: "higher_level_financial_qualification",
      },
      {
        label: "Yes, Qualification in the Economic field (eg. ACCA, FCCA or similar)",
        value: "economic_field_qualification",
      },
      {
        label: "Yes, University level degree (eg. Maths or similar)",
        value: "university_level_degree",
      },
      { label: "None of the above", value: "none_of_the_above" },
      { label: "Other", value: "other" },
    ],
  },
  {
    section: "financial_information",
    question_key: "annual_income",
    question_text: "Annual Income",
    answer_type: "single_choice",
    sort_order: 17,
    options: [
      {
        label: "Less than $10,000 or Equivalent",
        value: "less_than_10000",
      },
      { label: "$10,000-$50,000", value: "10000_50000" },
      { label: "$50,000 - $100,000", value: "50000_100000" },
      { label: "More than $100,000", value: "more_than_100000" },
      { label: "Other", value: "other" },
    ],
  },
  {
    section: "financial_information",
    question_key: "financial_services_background",
    question_text: "Financial Services Background",
    answer_type: "multiple_choice",
    sort_order: 18,
    options: [
      { label: "None", value: "none" },
      { label: "Prior Education", value: "prior_education" },
      {
        label: "Professional Qualifications",
        value: "professional_qualifications",
      },
      { label: "Work Experience", value: "work_experience" },
      { label: "Other", value: "other" },
    ],
  },
  {
    section: "financial_information",
    question_key: "income_source",
    question_text: "Income Source",
    answer_type: "single_choice",
    sort_order: 19,
    options: [
      {
        label: "Employed - Private company",
        value: "employed_private_company",
      },
      { label: "Self Employed", value: "self_employed" },
      { label: "Student", value: "student" },
      { label: "Retired", value: "retired" },
      { label: "Unemployed", value: "unemployed" },
      {
        label: "Employed - Public company",
        value: "employed_public_company",
      },
      { label: "Employed", value: "employed" },
      { label: "Other", value: "other" },
    ],
  },
  {
    section: "financial_information",
    question_key: "source_of_funds",
    question_text: "Source of Funds",
    answer_type: "multiple_choice",
    sort_order: 20,
    options: [
      { label: "Employment", value: "employment" },
      { label: "Business Activities", value: "business_activities" },
      {
        label: "Investments & Dividends",
        value: "investments_dividends",
      },
      { label: "Rent", value: "rent" },
      { label: "Pension", value: "pension" },
      { label: "Other", value: "other" },
    ],
  },
  {
    section: "financial_information",
    question_key: "savings_and_investments_value",
    question_text: "Value of savings and investments",
    answer_type: "single_choice",
    sort_order: 21,
    options: [
      {
        label: "Less than $10,000 or Equivalent",
        value: "less_than_10000",
      },
      { label: "$10,000-$50,000", value: "10000_50000" },
      { label: "$50,000 - $100,000", value: "50000_100000" },
      { label: "More than $100,000", value: "more_than_100000" },
      { label: "Other", value: "other" },
    ],
  },
  {
    section: "financial_information",
    question_key: "purpose_of_trading",
    question_text: "Purpose of Trading",
    answer_type: "single_choice",
    sort_order: 22,
    options: [
      { label: "Hedging", value: "hedging" },
      { label: "Personal Investment", value: "personal_investment" },
      { label: "Speculation", value: "speculation" },
      { label: "Other", value: "other" },
    ],
  },
  {
    section: "financial_information",
    question_key: "anticipated_amount_to_deposit",
    question_text: "Anticipated Amount to Deposit",
    answer_type: "single_choice",
    sort_order: 23,
    options: [
      { label: "Up to $10,000", value: "up_to_10000" },
      {
        label: "Between $10,000 - $100,000",
        value: "between_10000_100000",
      },
      { label: "Above $100,000", value: "above_100000" },
      { label: "Other", value: "other" },
    ],
  },
];

const documentFields = [
  {
    key: "id_front",
    label: "ID front side",
    description: "Full color copy of your passport, ID card, or driver’s license.",
    sort_order: 24,
  },
  {
    key: "id_back",
    label: "ID back side",
    description: "Back side of your passport, ID card, or driver’s license if applicable.",
    sort_order: 25,
  },
  {
    key: "proof_of_address",
    label: "Proof of Address",
    description: "Utility bill or bank statement showing your address from within the last 3 months.",
    sort_order: 26,
  },
];

function VerificationFormPage() {
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const countryOptions = useMemo(() => countryList().getData(), []);

  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    certify_age: false,
    accept_agreement: false,
    first_name: "",
    surname: "",
    email: "",
    phone: "",
    id_passport_number: "",
    date_of_birth: "",
    country_of_residence: "",
    fatca_reportable_person: "",
    politically_exposed_person: "",
  });

  const [financialAnswers, setFinancialAnswers] = useState({});
  const [otherValues, setOtherValues] = useState({});
  const [files, setFiles] = useState({
    id_front: null,
    id_back: null,
    proof_of_address: null,
  });
  const [errors, setErrors] = useState({});

  const flowSteps = useMemo(
    () => [
      {
        key: "agreements",
        mainStep: "Personal Details",
        icon: "solar:user-linear",
        type: "agreements",
      },
      {
        key: "identity",
        mainStep: "Personal Details",
        icon: "solar:user-linear",
        type: "fields",
        fields: ["first_name", "surname", "email", "phone", "id_passport_number", "date_of_birth"],
      },
      {
        key: "country_of_residence",
        mainStep: "Personal Details",
        icon: "solar:user-linear",
        type: "country",
        title: "Country of residence",
        fields: ["country_of_residence"],
      },
      {
        key: "fatca_reportable_person",
        mainStep: "Personal Details",
        icon: "solar:user-linear",
        type: "personal_choice",
        title: "I am a US reportable Person for the Purposes of the Foreign Account Tax Compliance Act ('FATCA')",
        field: "fatca_reportable_person",
        fields: ["fatca_reportable_person"],
        options: yesNoOptions,
      },
      {
        key: "politically_exposed_person",
        mainStep: "Personal Details",
        icon: "solar:user-linear",
        type: "personal_choice",
        title: "Are you and any of your family members a PEP 'Politically Exposed Person'?",
        field: "politically_exposed_person",
        fields: ["politically_exposed_person"],
        options: yesNoOptions,
      },
      ...financialQuestions.map((question) => ({
        key: question.question_key,
        mainStep: "Financial Information",
        icon: "solar:case-linear",
        type: "financial_question",
        question,
      })),
      {
        key: "documents",
        mainStep: "Upload Documents",
        icon: "solar:file-text-linear",
        type: "documents",
        fields: ["id_front", "id_back", "proof_of_address"],
      },
      {
        key: "review",
        mainStep: "Review",
        icon: "solar:checklist-linear",
        type: "review",
      },
    ],
    [],
  );

  const activeStep = flowSteps[currentStep];
  const isReviewStep = activeStep.type === "review";

  function scrollContentToTop() {
    contentRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleInputChange(name, value) {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    clearError(name);
  }

  function handleFinancialAnswerChange(questionKey, value) {
    setFinancialAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionKey]: value,
    }));

    clearError(questionKey);
  }

  function handleMultipleChoiceChange(questionKey, optionValue) {
    const currentValues = financialAnswers[questionKey] || [];
    const exists = currentValues.includes(optionValue);

    const nextValues = exists
      ? currentValues.filter((value) => value !== optionValue)
      : [...currentValues, optionValue];

    setFinancialAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionKey]: nextValues,
    }));

    clearError(questionKey);

    if (optionValue === "other" && exists) {
      setOtherValues((currentValuesMap) => ({
        ...currentValuesMap,
        [questionKey]: "",
      }));
    }
  }

  function handleOtherValueChange(questionKey, value) {
    setOtherValues((currentValues) => ({
      ...currentValues,
      [questionKey]: value,
    }));

    clearError(`${questionKey}_other`);
  }

  function handleFileChange(fieldName, event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const fileError = validateFile(selectedFile);

    if (fileError) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [fieldName]: fileError,
      }));
      return;
    }

    setFiles((currentFiles) => ({
      ...currentFiles,
      [fieldName]: selectedFile,
    }));

    clearError(fieldName);
  }

  function handleFileRemove(fieldName) {
    setFiles((currentFiles) => ({
      ...currentFiles,
      [fieldName]: null,
    }));

    clearError(fieldName);
  }

  function clearError(name) {
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  function validateFile(file) {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !allowedFileExtensions.includes(extension)) {
      return "Only JPG, JPEG, PNG, and PDF files are allowed.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "File size must be 5MB or less.";
    }

    return "";
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidDate(dateValue) {
    if (!/^\d{2}-\d{2}-\d{4}$/.test(dateValue)) {
      return false;
    }

    const [day, month, year] = dateValue.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function getCountryLabel(value) {
    return countryOptions.find((option) => option.value === value)?.label || value;
  }

  function validateFields(fieldNames) {
    const nextErrors = {};

    fieldNames.forEach((fieldName) => {
      if (fieldName === "certify_age" && !formData.certify_age) {
        nextErrors.certify_age = "You must confirm that you are at least 18 years old.";
      }

      if (fieldName === "accept_agreement" && !formData.accept_agreement) {
        nextErrors.accept_agreement = "You must accept the Terms and Conditions and Privacy Policy.";
      }

      if (fieldName === "first_name" && !formData.first_name.trim()) {
        nextErrors.first_name = "First name is required.";
      }

      if (fieldName === "surname" && !formData.surname.trim()) {
        nextErrors.surname = "Surname is required.";
      }

      if (fieldName === "email") {
        if (!formData.email.trim()) {
          nextErrors.email = "Email is required.";
        } else if (!isValidEmail(formData.email.trim())) {
          nextErrors.email = "Enter a valid email address.";
        }
      }

      if (fieldName === "phone" && !formData.phone.trim()) {
        nextErrors.phone = "Phone number is required.";
      }

      if (fieldName === "id_passport_number" && !formData.id_passport_number.trim()) {
        nextErrors.id_passport_number = "ID / Passport number is required.";
      }

      if (fieldName === "date_of_birth") {
        if (!formData.date_of_birth.trim()) {
          nextErrors.date_of_birth = "Date of birth is required.";
        } else if (!isValidDate(formData.date_of_birth.trim())) {
          nextErrors.date_of_birth = "Use a valid DD-MM-YYYY date.";
        }
      }

      if (fieldName === "country_of_residence" && !formData.country_of_residence) {
        nextErrors.country_of_residence = "Country of residence is required.";
      }

      if (fieldName === "fatca_reportable_person" && !formData.fatca_reportable_person) {
        nextErrors.fatca_reportable_person = "Please select Yes or No.";
      }

      if (fieldName === "politically_exposed_person" && !formData.politically_exposed_person) {
        nextErrors.politically_exposed_person = "Please select Yes or No.";
      }

      if (["id_front", "id_back", "proof_of_address"].includes(fieldName)) {
        const file = files[fieldName];
        const document = documentFields.find((item) => item.key === fieldName);

        if (!file) {
          nextErrors[fieldName] = `${document?.label || "Document"} is required.`;
          return;
        }

        const fileError = validateFile(file);

        if (fileError) {
          nextErrors[fieldName] = fileError;
        }
      }
    });

    return nextErrors;
  }

  function validateFinancialQuestion(question) {
    const nextErrors = {};
    const value = financialAnswers[question.question_key];

    if (question.answer_type === "single_choice" && !value) {
      nextErrors[question.question_key] = "Please select an option.";
    }

    if (question.answer_type === "multiple_choice" && (!Array.isArray(value) || value.length === 0)) {
      nextErrors[question.question_key] = "Please select at least one option.";
    }

    if (question.answer_type === "single_choice" && value === "other" && !otherValues[question.question_key]?.trim()) {
      nextErrors[`${question.question_key}_other`] = "Please specify your answer.";
    }

    if (
      question.answer_type === "multiple_choice" &&
      Array.isArray(value) &&
      value.includes("other") &&
      !otherValues[question.question_key]?.trim()
    ) {
      nextErrors[`${question.question_key}_other`] = "Please specify your answer.";
    }

    return nextErrors;
  }

  function validateCurrentStep() {
    let stepErrors = {};

    if (activeStep.fields) {
      stepErrors = validateFields(activeStep.fields);
    }

    if (activeStep.type === "financial_question") {
      stepErrors = validateFinancialQuestion(activeStep.question);
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      ...stepErrors,
    }));

    return Object.keys(stepErrors).length === 0;
  }

  function validateAll() {
    const fieldErrors = validateFields([
      "certify_age",
      "accept_agreement",
      "first_name",
      "surname",
      "email",
      "phone",
      "id_passport_number",
      "date_of_birth",
      "country_of_residence",
      "fatca_reportable_person",
      "politically_exposed_person",
      "id_front",
      "id_back",
      "proof_of_address",
    ]);

    const financialErrors = financialQuestions.reduce(
      (allErrors, question) => ({
        ...allErrors,
        ...validateFinancialQuestion(question),
      }),
      {},
    );

    return {
      ...fieldErrors,
      ...financialErrors,
    };
  }

  function findFirstErrorStep(allErrors) {
    const errorKeys = Object.keys(allErrors);

    return flowSteps.findIndex((step) => {
      if (step.fields?.some((fieldName) => errorKeys.includes(fieldName))) {
        return true;
      }

      if (
        step.type === "financial_question" &&
        (errorKeys.includes(step.question.question_key) || errorKeys.includes(`${step.question.question_key}_other`))
      ) {
        return true;
      }

      return false;
    });
  }

  function handleNext() {
    if (submitting) {
      return;
    }

    if (!validateCurrentStep()) {
      Notification.error("Please complete the highlighted field.");
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, flowSteps.length - 1));

    window.requestAnimationFrame(() => {
      scrollContentToTop();
    });
  }

  function handleBack() {
    if (submitting) {
      return;
    }

    if (currentStep === 0) {
      navigate("/");
      return;
    }

    setCurrentStep((step) => Math.max(step - 1, 0));

    window.requestAnimationFrame(() => {
      scrollContentToTop();
    });
  }

  function handleClose() {
    if (submitting) {
      return;
    }

    navigate("/");
  }

  function getOptionLabel(options, value) {
    return options.find((option) => option.value === value)?.label || value;
  }

  function createAnswer({
    section,
    question_key,
    question_text,
    answer_type,
    answer_value,
    answer_label,
    other_value = null,
    sort_order,
  }) {
    return {
      section,
      question_key,
      question_text,
      answer_type,
      answer_value,
      answer_label,
      other_value,
      sort_order,
    };
  }

  function buildAnswers() {
    const answers = [
      createAnswer({
        section: "personal_details",
        question_key: "certify_age",
        question_text: "By checking this box, I certify that I am at least 18 years old.",
        answer_type: "checkbox",
        answer_value: "yes",
        answer_label: "Yes",
        sort_order: 1,
      }),
      createAnswer({
        section: "personal_details",
        question_key: "accept_terms_and_privacy",
        question_text: "I have read and accept the Terms and Conditions and Privacy Policy.",
        answer_type: "checkbox",
        answer_value: "yes",
        answer_label: "Yes",
        sort_order: 2,
      }),
      createAnswer({
        section: "personal_details",
        question_key: "first_name",
        question_text: "First Name",
        answer_type: "text",
        answer_value: formData.first_name.trim(),
        answer_label: formData.first_name.trim(),
        sort_order: 3,
      }),
      createAnswer({
        section: "personal_details",
        question_key: "surname",
        question_text: "Surname",
        answer_type: "text",
        answer_value: formData.surname.trim(),
        answer_label: formData.surname.trim(),
        sort_order: 4,
      }),
      createAnswer({
        section: "personal_details",
        question_key: "email",
        question_text: "Email",
        answer_type: "text",
        answer_value: formData.email.trim(),
        answer_label: formData.email.trim(),
        sort_order: 5,
      }),
      createAnswer({
        section: "personal_details",
        question_key: "phone",
        question_text: "Phone",
        answer_type: "text",
        answer_value: formData.phone.trim(),
        answer_label: formData.phone.trim(),
        sort_order: 6,
      }),
      createAnswer({
        section: "personal_details",
        question_key: "id_passport_number",
        question_text: "ID / Passport Number",
        answer_type: "text",
        answer_value: formData.id_passport_number.trim(),
        answer_label: formData.id_passport_number.trim(),
        sort_order: 7,
      }),
      createAnswer({
        section: "personal_details",
        question_key: "date_of_birth",
        question_text: "Date of birth",
        answer_type: "date",
        answer_value: formData.date_of_birth.trim(),
        answer_label: formData.date_of_birth.trim(),
        sort_order: 8,
      }),
      createAnswer({
        section: "personal_details",
        question_key: "country_of_residence",
        question_text: "Country of residence",
        answer_type: "single_choice",
        answer_value: getCountryLabel(formData.country_of_residence),
        answer_label: getCountryLabel(formData.country_of_residence),
        sort_order: 9,
      }),
      createAnswer({
        section: "personal_details",
        question_key: "fatca_reportable_person",
        question_text:
          "I am a US reportable Person for the Purposes of the Foreign Account Tax Compliance Act ('FATCA')",
        answer_type: "single_choice",
        answer_value: formData.fatca_reportable_person,
        answer_label: getOptionLabel(yesNoOptions, formData.fatca_reportable_person),
        sort_order: 10,
      }),
      createAnswer({
        section: "personal_details",
        question_key: "politically_exposed_person",
        question_text: "Are you and any of your family members a PEP 'Politically Exposed Person'?",
        answer_type: "single_choice",
        answer_value: formData.politically_exposed_person,
        answer_label: getOptionLabel(yesNoOptions, formData.politically_exposed_person),
        sort_order: 11,
      }),
    ];

    financialQuestions.forEach((question) => {
      const value = financialAnswers[question.question_key];

      if (question.answer_type === "single_choice") {
        answers.push(
          createAnswer({
            section: question.section,
            question_key: question.question_key,
            question_text: question.question_text,
            answer_type: question.answer_type,
            answer_value: value,
            answer_label: getOptionLabel(question.options, value),
            other_value: value === "other" ? otherValues[question.question_key]?.trim() || null : null,
            sort_order: question.sort_order,
          }),
        );
      }

      if (question.answer_type === "multiple_choice") {
        value.forEach((selectedValue) => {
          answers.push(
            createAnswer({
              section: question.section,
              question_key: question.question_key,
              question_text: question.question_text,
              answer_type: question.answer_type,
              answer_value: selectedValue,
              answer_label: getOptionLabel(question.options, selectedValue),
              other_value: selectedValue === "other" ? otherValues[question.question_key]?.trim() || null : null,
              sort_order: question.sort_order,
            }),
          );
        });
      }
    });

    documentFields.forEach((document) => {
      answers.push(
        createAnswer({
          section: "documents",
          question_key: document.key,
          question_text: document.label,
          answer_type: "text",
          answer_value: files[document.key]?.name || "",
          answer_label: files[document.key]?.name || "",
          sort_order: document.sort_order,
        }),
      );
    });

    return answers;
  }

  function buildSubmitFormData() {
    const submitFormData = new FormData();

    submitFormData.append("first_name", formData.first_name.trim());
    submitFormData.append("surname", formData.surname.trim());
    submitFormData.append("email", formData.email.trim());
    submitFormData.append("phone", formData.phone.trim());
    submitFormData.append("id_passport_number", formData.id_passport_number.trim());
    submitFormData.append("date_of_birth", formData.date_of_birth.trim());
    submitFormData.append("country_of_residence", getCountryLabel(formData.country_of_residence));
    submitFormData.append("answers", JSON.stringify(buildAnswers()));

    documentFields.forEach((document) => {
      submitFormData.append(document.key, files[document.key]);
    });

    return submitFormData;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const allErrors = validateAll();
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      const firstErrorStep = findFirstErrorStep(allErrors);
      setCurrentStep(firstErrorStep === -1 ? 0 : firstErrorStep);
      Notification.error("Please complete all required fields before submitting.");

      window.requestAnimationFrame(() => {
        scrollContentToTop();
      });

      return;
    }

    try {
      setSubmitting(true);

      const response = await API.private.submitVerification(buildSubmitFormData());

      if (response?.data?.code === "OK") {
        Notification.success(response.data.message || "Verification submitted successfully.");
        navigate("/success", { replace: true });
        return;
      }

      Notification.error("Verification submission failed.");
    } catch (error) {
      const errorMessage = error?.response?.data?.error || "Verification submission failed.";
      Notification.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  function renderProgressBar() {
    return (
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-border">
        {flowSteps.map((step, index) => (
          <div
            key={step.key}
            className={["h-full flex-1 transition", index <= currentStep ? "bg-accent-1" : "bg-transparent"].join(" ")}
          />
        ))}
      </div>
    );
  }

  function renderError(name) {
    if (!errors[name]) {
      return null;
    }

    return <p className="mt-2 text-xs font-semibold text-accent-2 sm:text-sm">{errors[name]}</p>;
  }

  function renderOptionCard({ selected, label, onClick, multiple = false }) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={submitting}
        className={[
          "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-4",
          selected
            ? "border-accent-1 bg-accent-1/15 text-text ring-2 ring-accent-1/25"
            : "border-border bg-card text-text/70 hover:border-accent-1 hover:bg-card",
          submitting ? "cursor-not-allowed opacity-70" : "",
        ].join(" ")}
      >
        <span className="text-sm font-semibold leading-5 sm:text-base sm:leading-6">{label}</span>

        <span
          className={[
            "flex size-5 shrink-0 items-center justify-center border transition sm:size-6",
            multiple ? "rounded-md" : "rounded-full",
            selected ? "border-accent-1 bg-accent-1 text-card" : "border-border bg-background text-transparent",
          ].join(" ")}
        >
          <Icon icon="solar:check-linear" className="size-3.5 sm:size-4" />
        </span>
      </button>
    );
  }

  function renderAgreementOption({ selected, label, onClick }) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={submitting}
        className={[
          "mt-4 flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition sm:mt-5 sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-4",
          selected
            ? "border-accent-1 bg-accent-1/15 text-text ring-2 ring-accent-1/25"
            : "border-border bg-card text-text hover:border-accent-1",
          submitting ? "cursor-not-allowed opacity-70" : "",
        ].join(" ")}
      >
        <span className="text-sm font-semibold sm:text-base">{label}</span>

        <span
          className={[
            "flex size-5 shrink-0 items-center justify-center rounded-md border transition sm:size-6",
            selected ? "border-accent-1 bg-accent-1 text-card" : "border-border bg-background text-transparent",
          ].join(" ")}
        >
          <Icon icon="solar:check-linear" className="size-3.5 sm:size-4" />
        </span>
      </button>
    );
  }

  function renderAgreements() {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div>
          <p className="text-base font-semibold leading-7 tracking-wide text-text sm:text-xl sm:leading-8">
            By checking this box, I certify that I am at least 18 years old.
          </p>

          {renderAgreementOption({
            selected: formData.certify_age,
            label: "Yes",
            onClick: () => handleInputChange("certify_age", !formData.certify_age),
          })}

          {renderError("certify_age")}
        </div>

        <div className="border-t border-border pt-6 sm:pt-8">
          <p className="text-base font-semibold leading-7 tracking-wide text-text sm:text-xl sm:leading-8">
            I have read and accept the{" "}
            <a
              href="https://www.eazymarkets.com/legal"
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="font-bold text-accent-2 underline-offset-4 hover:underline"
            >
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a
              href="https://www.eazymarkets.com/privacy"
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="font-bold text-accent-2 underline-offset-4 hover:underline"
            >
              Privacy Policy
            </a>
            .
          </p>

          {renderAgreementOption({
            selected: formData.accept_agreement,
            label: "Yes",
            onClick: () => handleInputChange("accept_agreement", !formData.accept_agreement),
          })}

          {renderError("accept_agreement")}
        </div>
      </div>
    );
  }

  function renderIdentityFields() {
    return (
      <div className="space-y-4 sm:space-y-5">
        <TextInput
          label="First Name"
          placeholder="Enter your first name"
          value={formData.first_name}
          error={errors.first_name}
          onChange={(event) => handleInputChange("first_name", event.target.value)}
        />

        <TextInput
          label="Surname"
          placeholder="Enter your surname"
          value={formData.surname}
          error={errors.surname}
          onChange={(event) => handleInputChange("surname", event.target.value)}
        />

        <TextInput
          label="Email"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          error={errors.email}
          onChange={(event) => handleInputChange("email", event.target.value)}
        />

        <PhoneInput
          label="Phone"
          value={formData.phone}
          error={errors.phone}
          onChange={(value) => handleInputChange("phone", value)}
        />

        <TextInput
          label="ID / Passport Number"
          placeholder="Enter your ID or passport number"
          value={formData.id_passport_number}
          error={errors.id_passport_number}
          onChange={(event) => handleInputChange("id_passport_number", event.target.value)}
        />

        <TextInput
          label="Date of birth"
          placeholder="DD-MM-YYYY"
          value={formData.date_of_birth}
          error={errors.date_of_birth}
          onChange={(event) => handleInputChange("date_of_birth", event.target.value)}
        />
      </div>
    );
  }

  function renderCountrySelect() {
    return (
      <div>
        <div className="mx-auto mb-5 max-w-xl text-center sm:mb-8">
          <Heading as="h1" className="text-xl sm:text-2xl">
            Country of residence
          </Heading>
        </div>

        <Select
          label="Country"
          placeholder="Select your country"
          options={countryOptions}
          value={formData.country_of_residence}
          error={errors.country_of_residence}
          onChange={(value) => handleInputChange("country_of_residence", value)}
        />
      </div>
    );
  }

  function renderPersonalChoice() {
    const selectedValue = formData[activeStep.field];

    return (
      <div>
        <p className="text-base font-semibold leading-7 tracking-wide text-text sm:text-xl sm:leading-8">
          {activeStep.title}
        </p>

        <div className="mt-5 space-y-3 sm:mt-8">
          {activeStep.options.map((option) => (
            <div key={option.value}>
              {renderOptionCard({
                selected: selectedValue === option.value,
                label: option.label,
                onClick: () => handleInputChange(activeStep.field, option.value),
              })}
            </div>
          ))}
        </div>

        {renderError(activeStep.field)}
      </div>
    );
  }

  function renderFinancialQuestion() {
    const question = activeStep.question;
    const value = financialAnswers[question.question_key];
    const selectedValues = Array.isArray(value) ? value : [];

    return (
      <div>
        <div className="mx-auto mb-5 max-w-2xl text-center sm:mb-8">
          <Heading as="h1" className="text-xl leading-7 sm:text-2xl sm:leading-8">
            {question.question_text}
          </Heading>
        </div>

        <div className="space-y-3">
          {question.options.map((option) => {
            const selected =
              question.answer_type === "multiple_choice"
                ? selectedValues.includes(option.value)
                : value === option.value;

            return (
              <div key={option.value}>
                {renderOptionCard({
                  selected,
                  label: option.label,
                  multiple: question.answer_type === "multiple_choice",
                  onClick: () => {
                    if (question.answer_type === "multiple_choice") {
                      handleMultipleChoiceChange(question.question_key, option.value);
                      return;
                    }

                    handleFinancialAnswerChange(question.question_key, option.value);
                  },
                })}
              </div>
            );
          })}
        </div>

        {((question.answer_type === "single_choice" && value === "other") ||
          (question.answer_type === "multiple_choice" && selectedValues.includes("other"))) && (
          <div className="mt-5 sm:mt-6">
            <TextInput
              label="Please specify"
              placeholder="Enter your answer"
              value={otherValues[question.question_key] || ""}
              error={errors[`${question.question_key}_other`]}
              onChange={(event) => handleOtherValueChange(question.question_key, event.target.value)}
            />
          </div>
        )}

        {renderError(question.question_key)}
      </div>
    );
  }

  function renderDocuments() {
    return (
      <div>
        <div className="space-y-4 sm:space-y-5">
          {documentFields.map((document) => (
            <div key={document.key} className="rounded-xl border border-border bg-card p-3 sm:rounded-2xl sm:p-4">
              <div className="mb-4">
                <p className="text-sm font-semibold text-text sm:text-base">{document.label}</p>
                <p className="mt-1 text-xs leading-5 text-text/60 sm:text-sm sm:leading-6">{document.description}</p>
              </div>

              <StyledFileInput
                label=""
                file={files[document.key]}
                onChange={(event) => handleFileChange(document.key, event)}
                onRemove={() => handleFileRemove(document.key)}
                accept=".jpg,.jpeg,.png,.pdf"
                preferredSize="JPG, PNG or PDF. Max 5MB"
              />

              {renderError(document.key)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderReviewRow(label, value) {
    return (
      <div className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-text/60 sm:text-sm">{label}</p>
        <p className="wrap-break-word text-sm font-bold text-text sm:text-right">{value || "N/A"}</p>
      </div>
    );
  }

  function renderReview() {
    return (
      <div>
        <div className="mb-5 text-center sm:mb-6">
          <Heading as="h1" className="text-xl sm:text-2xl">
            Review & Submit
          </Heading>
          <p className="mt-2 text-xs leading-5 text-text/60 sm:text-sm sm:leading-6">
            Check the key details below before submitting.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:rounded-2xl sm:p-4">
          {renderReviewRow("Name", `${formData.first_name} ${formData.surname}`.trim())}
          {renderReviewRow("Email", formData.email)}
          {renderReviewRow("Phone", formData.phone)}
          {renderReviewRow("ID / Passport", formData.id_passport_number)}
          {renderReviewRow("Date of birth", formData.date_of_birth)}
          {renderReviewRow("Country", getCountryLabel(formData.country_of_residence))}
          {renderReviewRow("ID front side", files.id_front?.name)}
          {renderReviewRow("ID back side", files.id_back?.name)}
          {renderReviewRow("Proof of Address", files.proof_of_address?.name)}
        </div>
      </div>
    );
  }

  function renderSubmittingOverlay() {
    if (!submitting) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-4 backdrop-blur-sm">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 text-center shadow-2xl shadow-accent-2/10">
          <div className="absolute -left-12 -top-12 size-32 rounded-full bg-accent-1/20 blur-2xl" />
          <div className="absolute -bottom-12 -right-12 size-32 rounded-full bg-accent-2/20 blur-2xl" />

          <div className="relative mx-auto mb-6 flex size-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-border" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-accent-1 border-r-accent-2" />

            <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-background shadow-lg">
              <Icon icon="solar:shield-check-bold" className="size-8 text-accent-2" />
            </div>
          </div>

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-2">Secure submission</p>

            <Heading as="h2" className="mt-3 text-2xl">
              Sending your verification
            </Heading>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-text/60">
              Please keep this page open while we securely upload your details and documents.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-background p-3">
                <div className="mx-auto flex size-9 items-center justify-center rounded-xl bg-accent-1/15 text-accent-2">
                  <Icon icon="solar:document-text-bold" className="size-5" />
                </div>
                <p className="mt-2 text-[11px] font-semibold text-text/60">Details</p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-3">
                <div className="mx-auto flex size-9 items-center justify-center rounded-xl bg-accent-1/15 text-accent-2">
                  <Icon icon="solar:folder-with-files-bold" className="size-5" />
                </div>
                <p className="mt-2 text-[11px] font-semibold text-text/60">Documents</p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-3">
                <div className="mx-auto flex size-9 items-center justify-center rounded-xl bg-accent-1/15 text-accent-2">
                  <Icon icon="solar:lock-keyhole-bold" className="size-5" />
                </div>
                <p className="mt-2 text-[11px] font-semibold text-text/60">Secure</p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-full bg-border">
              <div className="h-2 w-2/3 animate-pulse rounded-full bg-accent-1" />
            </div>

            <p className="mt-4 text-xs font-semibold text-text/50">This may take a few seconds.</p>
          </div>
        </div>
      </div>
    );
  }

  function renderCurrentContent() {
    if (activeStep.type === "agreements") {
      return renderAgreements();
    }

    if (activeStep.type === "fields") {
      return renderIdentityFields();
    }

    if (activeStep.type === "country") {
      return renderCountrySelect();
    }

    if (activeStep.type === "personal_choice") {
      return renderPersonalChoice();
    }

    if (activeStep.type === "financial_question") {
      return renderFinancialQuestion();
    }

    if (activeStep.type === "documents") {
      return renderDocuments();
    }

    return renderReview();
  }

  return (
    <section className="h-dvh overflow-hidden bg-background font-figtree text-text">
      <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
        <header className="z-30 shrink-0 border-b border-border bg-background px-4 pt-3 sm:px-6 sm:pt-4">
          <div className="mx-auto flex h-12 max-w-3xl items-center justify-between gap-3 sm:h-14">
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className={[
                "flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-text transition hover:bg-border sm:size-10",
                submitting ? "cursor-not-allowed opacity-60" : "",
              ].join(" ")}
              aria-label="Go back"
            >
              <Icon icon="solar:alt-arrow-left-linear" className="size-5 sm:size-6" />
            </button>

            <div className="flex min-w-0 items-center justify-center gap-2">
              <Icon icon={activeStep.icon} className="hidden size-6 shrink-0 text-text sm:block" />

              <p className="truncate text-center text-base font-bold text-text sm:text-xl">{activeStep.mainStep}</p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className={[
                "flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-text transition hover:bg-border sm:size-10",
                submitting ? "cursor-not-allowed opacity-60" : "",
              ].join(" ")}
              aria-label="Close verification form"
            >
              <Icon icon="solar:close-circle-linear" className="size-5 sm:size-6" />
            </button>
          </div>

          <div className="mx-auto max-w-3xl pb-3 pt-2 sm:pb-4 sm:pt-3">{renderProgressBar()}</div>
        </header>

        <main
          ref={contentRef}
          className={[
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 transition sm:px-6 sm:py-10",
            submitting ? "pointer-events-none opacity-40 blur-[1px]" : "",
          ].join(" ")}
        >
          <div className="mx-auto w-full max-w-3xl pb-6">{renderCurrentContent()}</div>
        </main>

        <footer className="z-30 shrink-0 border-t border-border bg-background px-4 py-3 sm:px-6 sm:py-4">
          <div className="mx-auto max-w-3xl">
            {isReviewStep ? (
              <Button
                type="submit"
                icon={submitting ? "solar:refresh-bold" : "solar:check-circle-bold"}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Securely Submitting..." : "Submit Verification"}
              </Button>
            ) : (
              <Button
                type="button"
                icon="solar:arrow-right-linear"
                iconPosition="right"
                onClick={handleNext}
                disabled={submitting}
                className="w-full"
              >
                Next
              </Button>
            )}
          </div>
        </footer>

        {renderSubmittingOverlay()}
      </form>
    </section>
  );
}

export default VerificationFormPage;
