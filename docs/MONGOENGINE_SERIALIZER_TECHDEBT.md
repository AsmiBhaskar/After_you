# MongoEngine & DRF Serializers: Technical Debt

## Context
- The project uses MongoEngine for some models (e.g., `LegacyMessage`).
- DRF's `Serializer` is used for these models, requiring manual field definitions and custom logic.
- This is more error-prone and harder to maintain than using Django ORM with DRF's `ModelSerializer`.

## Options to Explore
- Continue with custom DRF serializers for MongoEngine, but:
  - Keep them well-documented.
  - Add/maintain tests for all custom logic.
- Explore third-party packages:
  - [`drf-mongoengine`](https://github.com/umutbozkurt/django-rest-framework-mongoengine): Integrates MongoEngine with DRF, provides `DocumentSerializer` for less boilerplate.
  - Consider for future refactor or if serializer maintenance becomes a burden.
- If migrating to Django ORM in the future, switch to `ModelSerializer` for automatic field mapping and validation.

## Action Item
- Revisit this technical debt after other priorities are addressed.
- Evaluate `drf-mongoengine` or similar packages for possible adoption.
