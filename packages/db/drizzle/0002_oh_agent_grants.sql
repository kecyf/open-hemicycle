-- Grants oh_agent — compléter les droits ETL (ingest:deputes)
--
-- `ingest:deputes` rafraîchit affiliations_groupe et mandats via DELETE + INSERT
-- (source de vérité AMO10). oh_agent avait INSERT/SELECT/UPDATE uniquement → cron ETL
-- en échec (permission denied for table affiliations_groupe).
--
-- DELETE limité à ces 2 tables ; activite_journaliere et seed:themes restent hors oh_agent.
-- Idempotent : GRANT est ré-exécutable sans effet de bord.

GRANT DELETE ON TABLE public.affiliations_groupe TO oh_agent;
GRANT DELETE ON TABLE public.mandats TO oh_agent;
