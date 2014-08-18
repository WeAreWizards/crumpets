# Idea

We want to help people to decide whether renting or buying is a better
choice in their current situation.

In order to do so we'll show them after how many years renting becomes
more expensive than buying. In the short term renting tends to be
cheaper. For someone visiting London for a job for a few years renting
is usually the preferred way to go.

There are other factors, especially house price growth, that influence
the outcome strongly.

We'll have to make several assumptions, e.g. how much interest you'd
get for your money if you kept it instead of using it for the down
payment. We'll note those in the "Methodology" section.

# Details

We're calculating a function `buying_cheaper(year_from_purchase)` with
the following implicit parameters:

## Important

* house price
* expected yearly house price increase
* expected rent increase
* expected return on down payment
* mortgage rate (we assume 25 years)
* down payment
* inflation rate

## Guessable from data

* fees (ground rent + house fees)

## Less important

* estate agent renting fees
* maintenance for flat
* security deposit for renting
