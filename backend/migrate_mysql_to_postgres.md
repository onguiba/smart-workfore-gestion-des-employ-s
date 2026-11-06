# Migration MySQL vers PostgreSQL

## Guide de Migration des Données

Si vous avez déjà des données dans MySQL et souhaitez migrer vers PostgreSQL, suivez ce guide.

### Option 1 : Exportation/Importation Manuelle

#### 1. Exporter depuis MySQL
```bash
# Exporter les données MySQL
docker-compose exec mysql mysqldump -u smartworkforce -p smart_workforce > mysql_export.sql
```

#### 2. Convertir le schéma
Le fichier SQL MySQL nécessite quelques modifications pour PostgreSQL :

**Changements automatiques à faire :**
- `AUTO_INCREMENT` → `SERIAL` ou `GENERATED ALWAYS AS IDENTITY`
- `` ` `` (backticks) → `"` (guillemets doubles) ou les enlever
- `INT(11)` → `INTEGER`
- `VARCHAR(255)` → `VARCHAR(255)` (compatible)
- `ENUM` → `VARCHAR` avec `CHECK` constraint
- `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` → `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- `ON UPDATE CURRENT_TIMESTAMP` → Utiliser un TRIGGER

#### 3. Importer dans PostgreSQL
```bash
# Importer dans PostgreSQL
docker-compose exec -T postgres psql -U smartworkforce smart_workforce < postgres_import.sql
```

### Option 2 : Utiliser pgLoader (Recommandé)

pgLoader est un outil qui migre automatiquement de MySQL vers PostgreSQL.

#### Installation et Utilisation

```bash
# 1. Créer un fichier de configuration pgloader
cat > mysql_to_postgres.load << EOF
LOAD DATABASE
  FROM mysql://smartworkforce:smartworkforce2026@mysql:3306/smart_workforce
  INTO postgresql://smartworkforce:smartworkforce2026@postgres:5432/smart_workforce

WITH include drop, create tables, create indexes, reset sequences

SET work_mem to '16MB',
    maintenance_work_mem to '512 MB';

CAST type datetime to timestamptz
     drop default drop not null using zero-dates-to-null,
     type date drop not null drop default using zero-dates-to-null;
EOF

# 2. Exécuter pgLoader
docker run --rm --network=smart-workforce-network \
  -v $(pwd):/data \
  dimitri/pgloader:latest \
  pgloader /data/mysql_to_postgres.load
```

### Option 3 : Migration avec un Service Docker Dédié

Ajoutez ce service dans `docker-compose.yml` :

```yaml
  migrator:
    image: dimitri/pgloader:latest
    container_name: smart-workforce-migrator
    volumes:
      - ./migration.load:/migration.load
    networks:
      - smart-workforce-network
    command: pgloader /migration.load
```

### Différences Importantes MySQL vs PostgreSQL

| Fonctionnalité | MySQL | PostgreSQL |
|----------------|-------|------------|
| Auto-increment | `AUTO_INCREMENT` | `SERIAL` ou `GENERATED ALWAYS AS IDENTITY` |
| Quotes | `` ` `` | `"` ou aucun |
| Date/Time | `DATETIME` | `TIMESTAMP` |
| Enum | `ENUM('a','b')` | `VARCHAR CHECK (col IN ('a','b'))` ou type ENUM |
| Boolean | `TINYINT(1)` | `BOOLEAN` |
| String concat | `CONCAT()` | `||` ou `CONCAT()` |
| Limit/Offset | `LIMIT x OFFSET y` | `LIMIT x OFFSET y` (identique) |
| Case sensitivity | Insensible par défaut | Sensible |

### Script de Conversion Rapide

```bash
#!/bin/bash
# Script de conversion MySQL → PostgreSQL

input_file="mysql_export.sql"
output_file="postgres_import.sql"

# Remplacements basiques
sed -e 's/`//g' \
    -e 's/ AUTO_INCREMENT/ GENERATED ALWAYS AS IDENTITY/g' \
    -e 's/INT([0-9]*)/INTEGER/g' \
    -e 's/ TINYINT(1)/ BOOLEAN/g' \
    -e 's/ENGINE=InnoDB//g' \
    -e 's/DEFAULT CHARSET=utf8mb4//g' \
    -e 's/COLLATE=utf8mb4_unicode_ci//g' \
    "$input_file" > "$output_file"

echo "Conversion terminée: $output_file"
echo "⚠️  Vérifiez manuellement les ENUM et triggers!"
```

### Vérification Post-Migration

```sql
-- Vérifier le nombre d'enregistrements
SELECT 'employees' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'hr_users', COUNT(*) FROM hr_users
UNION ALL
SELECT 'attendance_records', COUNT(*) FROM attendance_records
UNION ALL
SELECT 'leaves', COUNT(*) FROM leaves
UNION ALL
SELECT 'payroll', COUNT(*) FROM payroll
UNION ALL
SELECT 'missions', COUNT(*) FROM missions;

-- Vérifier les séquences (auto-increment)
SELECT 
    schemaname,
    sequencename,
    last_value
FROM pg_sequences
WHERE schemaname = 'public';

-- Réinitialiser les séquences si nécessaire
SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));
SELECT setval('hr_users_id_seq', (SELECT MAX(id) FROM hr_users));
```

### Avantages PostgreSQL

✅ **Performance**
- Meilleure gestion des requêtes complexes
- Index plus performants (GIN, GIST, etc.)
- Meilleure concurrence (MVCC)

✅ **Fonctionnalités**
- Support JSON/JSONB natif
- Full-text search intégré
- Types de données avancés
- Extensions puissantes

✅ **Standards**
- Plus conforme SQL
- Meilleure intégrité des données
- Transactions ACID strictes

✅ **Gratuit et Open Source**
- Vraiment open source (pas de version Enterprise)
- Pas de limitations de fonctionnalités
- Grande communauté

### Support

Pour toute question sur la migration :
- Documentation PostgreSQL : https://www.postgresql.org/docs/
- pgLoader : https://pgloader.io/
- Forum PostgreSQL : https://www.postgresql.org/community/
