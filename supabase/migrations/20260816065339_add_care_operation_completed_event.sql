-- Canonical event for aquarium-scoped completion of a care guide operation.
-- Application/API contracts already treat this as a first-class care event.

alter type public.care_event_type
  add value if not exists 'care_operation_completed';
