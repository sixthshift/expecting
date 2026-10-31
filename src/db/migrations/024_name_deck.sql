-- The names game deals from a deck of names (src/lib/nameDeck.data.json) as
-- well as the ones either of you adds. A deck name gets its row the first time
-- someone votes on it, marked as from the deck: the other isn't shown it until
-- they come to it themselves, unless it was liked.

ALTER TABLE `baby_name` ADD `from_deck` integer DEFAULT 0 NOT NULL CHECK (`from_deck` IN (0, 1));
