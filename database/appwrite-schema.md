# Appwrite Schema

Create one database, then create these collections. The app reads public agent data with the web SDK and uses Appwrite Account for email/password auth.

## Collections

### agents

Recommended collection ID: `agents`

Attributes:

- `name` string, required
- `email` string, required
- `phone` string, required
- `photo_url` url/string
- `brokerage` string, required
- `commission_rate` float, required
- `years_experience` integer, required
- `total_sales` integer, required
- `avg_days_on_market` integer, required
- `rating` float, required
- `review_count` integer, required
- `bio` string, required
- `specialties` string array
- `languages` string array
- `license_number` string, required
- `office_address` string, required
- `latitude` float, required
- `longitude` float, required
- `area_served` string, required
- `city` string, required
- `state` string, required
- `zip_codes` string array
- `neighborhoods` string array
- `verified` boolean
- `accepts_referrals` boolean

Note: Appwrite's free plan may limit collection attributes. The app defaults `service_radius_miles` to `25` if you do not store it.

Suggested indexes:

- `rating_desc`: key `rating`, order desc
- `commission_asc`: key `commission_rate`, order asc
- `city_state`: keys `city`, `state`
- `zip_codes`: key `zip_codes`
- `license_number`: key `license_number`

Permissions:

- Read: `Any`
- Create/update/delete: admin or agent-owner roles only

### reviews

Recommended collection ID: `reviews`

Attributes: `agent_id`, `reviewer_name`, `rating`, `comment`, `property_type`, `transaction_type`, `created_at`.

### recent_sales

Recommended collection ID: `recent_sales`

Attributes: `agent_id`, `address`, `city`, `state`, `zip_code`, `price`, `property_type`, `bedrooms`, `bathrooms`, `square_feet`, `sold_date`, `days_on_market`, `image_url`.

## Search Notes

The current app performs client-side matching over the loaded agent set across name, brokerage, contact fields, license, city, state, ZIP codes, neighborhoods, specialties, and languages. For a larger dataset, move this to Appwrite queries plus a denormalized `search_text` attribute or Appwrite full-text index when available in your plan.
