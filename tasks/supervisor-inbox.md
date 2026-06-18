# Inbox superviseur — décisions HITL

Fichier **append-only** : le superviseur y enregistre ses décisions via `/admin`.
L'agent autonome lit la **dernière entrée** au daily standup et agit en conséquence.

Format d'une entrée :

```markdown
## YYYY-MM-DDTHH:MM:SSZ — login_github

**Contexte** : ...
**Décision** : ...
**Relance agent** : oui | non
```

---
