const SHARED_DEFINITIONS = {
    "BBox": {
        "type": "object",
        "properties": {
            "ymin": { "type": "number" },
            "xmin": { "type": "number" },
            "ymax": { "type": "number" },
            "xmax": { "type": "number" },
            "page": { "type": "number" }
        }
    },
    "StringMeta": {
        "type": "object",
        "properties": {
            "value": { "type": "string" },
            "confidence": { "type": "number" },
            "bbox": { "$ref": "#/definitions/BBox" }
        }
    },
    "NumberMeta": {
        "type": "object",
        "properties": {
            "value": { "type": "number" },
            "confidence": { "type": "number" },
            "bbox": { "$ref": "#/definitions/BBox" }
        }
    },
    "DateWithMeta": {
        "type": "object",
        "additionalProperties": false,
        "required": ["value", "confidence", "bbox"],
        "properties": {
            "value": { "type": "string", "format": "date" },
            "confidence": { "type": "number" },
            "bbox": { "$ref": "#/definitions/BBox" }
        }
    },
};

export const BASIC_INFO_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "firstName": { "$ref": "#/definitions/StringMeta" },
        "lastName": { "$ref": "#/definitions/StringMeta" },
        "email": { "$ref": "#/definitions/StringMeta" },
        "phone": { "$ref": "#/definitions/StringMeta" },
        "countryCode": { "$ref": "#/definitions/StringMeta" },
        "address": {
            "type": "object",
            "properties": {
                "city": { "$ref": "#/definitions/StringMeta" },
                "country": { "$ref": "#/definitions/StringMeta" }
            }
        }
    },
    "definitions": SHARED_DEFINITIONS
};

export const EXPERIENCE_EDUCATION_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "professionalExperiences": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "jobTitle": { "$ref": "#/definitions/StringMeta" },
                    "organizationName": { "$ref": "#/definitions/StringMeta" },
                    "startDate": { "$ref": "#/definitions/DateWithMeta" },
                    "endDate": { "$ref": "#/definitions/DateWithMeta" }
                }
            }
        },
        "educationBackgrounds": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "degreeTitle": { "$ref": "#/definitions/StringMeta" },
                    "institution": { "$ref": "#/definitions/StringMeta" },
                    "courseStart": { "$ref": "#/definitions/StringMeta" },
                    "courseEnd": { "$ref": "#/definitions/StringMeta" },
                    "securedGpa": { "$ref": "#/definitions/StringMeta" },
                    "totalGpa": { "$ref": "#/definitions/StringMeta" },
                    "percentage": { "$ref": "#/definitions/StringMeta" }
                }
            }
        }
    },
    "definitions": SHARED_DEFINITIONS
};

export const TEST_SCORES_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "languageTestScores": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "testType": { "$ref": "#/definitions/StringMeta" },
                    "overall": { "$ref": "#/definitions/NumberMeta" },
                    "reading": { "$ref": "#/definitions/NumberMeta" },
                    "writing": { "$ref": "#/definitions/NumberMeta" },
                    "speaking": { "$ref": "#/definitions/NumberMeta" },
                    "listening": { "$ref": "#/definitions/NumberMeta" }
                }
            }
        }
    },
    "definitions": SHARED_DEFINITIONS
};

export const APPLICATION_SUMMAARY_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "startDate": { "$ref": "#/definitions/DateWithMeta" },
        "endDate": { "$ref": "#/definitions/DateWithMeta" },
        "initialTutionFee": { "$ref": "#/definitions/NumberMeta" },
        "totalTutionFee": { "$ref": "#/definitions/NumberMeta" }
    },
    "definitions": SHARED_DEFINITIONS
}
// For backward compatibility if needed elsewhere, though we should migrate
export const CONTACT_INGESTION_SCHEMA = BASIC_INFO_SCHEMA;
