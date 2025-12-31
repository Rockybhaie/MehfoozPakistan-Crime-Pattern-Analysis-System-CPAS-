-- Quick test to check Crime_Witness table structure
DESCRIBE c##irfan.Crime_Witness;

-- Check if witness #1 is already linked to crime #1
SELECT * FROM c##irfan.Crime_Witness WHERE Crime_ID = 1;
