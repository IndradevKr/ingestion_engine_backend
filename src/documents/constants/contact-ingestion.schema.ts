export const CONTACT_INGESTION_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "additionalProperties": false,
    "required": ["contacts"],
    "properties": {
        "contacts": {
            "type": "array",
            "items": { "$ref": "#/definitions/ContactIngest" }
        }
    },

    "definitions": {
        "BoundingBox": {
            "type": "object",
            "additionalProperties": false,
            "required": ["ymin", "xmin", "ymax", "xmax", "page"],
            "properties": {
                "ymin": { "type": "number" },
                "xmin": { "type": "number" },
                "ymax": { "type": "number" },
                "xmax": { "type": "number" },
                "page": { "type": "integer", "minimum": 1 }
            }
        },

        "StringWithMeta": {
            "type": "object",
            "additionalProperties": false,
            "required": ["value", "confidence", "boundingbox"],
            "properties": {
                "value": { "type": "string" },
                "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
                "boundingbox": { "$ref": "#/definitions/BoundingBox" }
            }
        },

        "NumberWithMeta": {
            "type": "object",
            "additionalProperties": false,
            "required": ["value", "confidence", "boundingbox"],
            "properties": {
                "value": { "type": "number" },
                "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
                "boundingbox": { "$ref": "#/definitions/BoundingBox" }
            }
        },

        "DateWithMeta": {
            "type": "object",
            "additionalProperties": false,
            "required": ["value", "confidence", "boundingbox"],
            "properties": {
                "value": { "type": "string", "format": "date" },
                "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
                "boundingbox": { "$ref": "#/definitions/BoundingBox" }
            }
        },

        "ContactIngest": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "firstName": { "$ref": "#/definitions/StringWithMeta" },
                "lastName": { "$ref": "#/definitions/StringWithMeta" },
                "email": { "$ref": "#/definitions/StringWithMeta" },

                "countryCode": { "$ref": "#/definitions/StringWithMeta" },
                "phone": { "$ref": "#/definitions/StringWithMeta" },

                "address": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "street": { "$ref": "#/definitions/StringWithMeta" },
                        "city": { "$ref": "#/definitions/StringWithMeta" },
                        "state": { "$ref": "#/definitions/StringWithMeta" },
                        "country": { "$ref": "#/definitions/StringWithMeta" },
                        "postalCode": { "$ref": "#/definitions/StringWithMeta" }
                    }
                },
                "addressLineOne": { "$ref": "#/definitions/AddressLineOneIngest" },

                "applicationSummary": { "$ref": "#/definitions/ApplicationSummaryIngest" },

                "professionalExperiences": {
                    "type": "array",
                    "items": { "$ref": "#/definitions/ProfessionalExperienceIngest" }
                },

                "educationBackgrounds": {
                    "type": "array",
                    "items": { "$ref": "#/definitions/EducationIngest" }
                },

                "languageTestScores": {
                    "type": "array",
                    "items": { "$ref": "#/definitions/LanguageTestIngest" }
                }
            }
        },

        "ApplicationSummaryIngest": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "type": { "$ref": "#/definitions/StringWithMeta" },
                "values": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "startDate": { "$ref": "#/definitions/DateWithMeta" },
                        "endDate": { "$ref": "#/definitions/DateWithMeta" },
                        "initialTutionFee": { "$ref": "#/definitions/NumberWithMeta" },
                        "totalTutionFee": { "$ref": "#/definitions/NumberWithMeta" }
                    }
                }
            }
        },

        "ProfessionalExperienceIngest": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "jobTitle": { "$ref": "#/definitions/StringWithMeta" },
                "organizationName": { "$ref": "#/definitions/StringWithMeta" },
                "startDate": { "$ref": "#/definitions/DateWithMeta" },
                "endDate": { "$ref": "#/definitions/DateWithMeta" }
            }
        },

        "EducationIngest": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "degreeTitle": { "$ref": "#/definitions/StringWithMeta" },
                "institution": { "$ref": "#/definitions/StringWithMeta" },
                "courseStart": { "$ref": "#/definitions/DateWithMeta" },
                "courseEnd": { "$ref": "#/definitions/DateWithMeta" },

                "securedGpa": { "$ref": "#/definitions/NumberWithMeta" },
                "totalGpa": { "$ref": "#/definitions/NumberWithMeta" },
                "percentage": { "$ref": "#/definitions/NumberWithMeta" }
            }
        },

        "LanguageTestIngest": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "testType": { "$ref": "#/definitions/StringWithMeta" },
                "scores": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "overall": { "$ref": "#/definitions/NumberWithMeta" },
                        "reading": { "$ref": "#/definitions/NumberWithMeta" },
                        "writing": { "$ref": "#/definitions/NumberWithMeta" },
                        "speaking": { "$ref": "#/definitions/NumberWithMeta" },
                        "listening": { "$ref": "#/definitions/NumberWithMeta" }
                    }
                }
            }
        },

        "AddressLineOneIngest": {
            "type": "object",
            "additionalProperties": false,
            "required": ["value", "confidence", "boundingbox"],
            "properties": {
                "value": {
                    "type": "string",
                    "description": "Full raw address line as extracted from document"
                },
                "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
                "boundingbox": { "$ref": "#/definitions/BoundingBox" }
            }
        }

    }
}
