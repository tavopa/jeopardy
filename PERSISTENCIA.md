# 💾 Guía de Persistencia de Datos

## 📊 Base de Datos Persistente

La base de datos SQLite ahora es **persistente** y mantiene todos los datos entre reinicios del contenedor.

### 🔧 Configuración Implementada

#### Volumen Docker
```yaml
volumes:
  jeopardy_data:
    driver: local
```

Este volumen se monta en `/app/data` dentro del contenedor del backend y persiste todos los datos.

#### Ubicación de la Base de Datos
- **Dentro del contenedor:** `/app/data/jeopardy.db`
- **Volumen Docker:** `jeopardy_data`
- **Configuración:** Variable de entorno `DATABASE_URL=sqlite:///./data/jeopardy.db`

### 📁 Datos que se Persisten

1. **✅ Preguntas del juego** - Creadas desde el panel de administración
2. **✅ Usuarios registrados** - Se mantienen entre juegos
3. **✅ Historial de respuestas** - Registro de partidas anteriores

### 🎯 Inicialización Automática

Al iniciar el contenedor por primera vez:
1. Se crea el directorio `/app/data` si no existe
2. Se ejecuta `init_db.py` que:
   - Crea las tablas de la base de datos
   - Si no hay preguntas, agrega 5 preguntas de ejemplo
   - Si ya hay preguntas, no hace nada

### 🚀 Comandos Útiles

#### Ver el volumen
```bash
docker volume ls
# Busca: jeopardy_jeopardy_data
```

#### Inspeccionar el volumen
```bash
docker volume inspect jeopardy_jeopardy_data
```

#### Hacer backup de la base de datos
```bash
# Copiar la BD del volumen a tu máquina
docker cp jeopardy-backend-1:/app/data/jeopardy.db ./backup_jeopardy.db
```

#### Restaurar backup
```bash
# Copiar backup al contenedor
docker cp ./backup_jeopardy.db jeopardy-backend-1:/app/data/jeopardy.db
```

#### Resetear la base de datos
```bash
# Detener contenedores
docker-compose down

# Eliminar el volumen
docker volume rm jeopardy_jeopardy_data

# Reiniciar (se creará nuevo volumen vacío)
docker-compose up --build -d
```

### 🔍 Verificar Persistencia

1. **Agrega una pregunta** desde el panel de administración
2. **Reinicia los contenedores:**
   ```bash
   docker-compose restart
   ```
3. **Verifica** que la pregunta siga ahí en el panel de administración

### ⚠️ Importante

- **NO elimines el volumen** `jeopardy_jeopardy_data` si quieres mantener tus datos
- **Haz backups regulares** si tienes datos importantes
- **El comando `docker-compose down -v`** eliminará el volumen y perderás todos los datos

### 📝 Ejemplo de Flujo

```bash
# Primer inicio (base de datos vacía)
docker-compose up -d
# → Se crean 5 preguntas de ejemplo automáticamente

# Agregar más preguntas desde el admin
# http://localhost:3000 → ADMINISTRAR

# Reiniciar contenedores
docker-compose restart
# → Las preguntas siguen ahí ✅

# Detener sin perder datos
docker-compose down
# → Datos persisten en el volumen ✅

# Reiniciar después
docker-compose up -d
# → Todas las preguntas siguen disponibles ✅
```

### 🛠️ Solución de Problemas

#### Las preguntas se siguen borrando
1. Verifica que el volumen esté montado:
   ```bash
   docker inspect jeopardy-backend-1 | grep -A 10 Mounts
   ```
2. Debe mostrar: `"Destination": "/app/data"`

#### Quiero empezar desde cero
```bash
docker-compose down
docker volume rm jeopardy_jeopardy_data
docker-compose up --build -d
```

#### Ver logs de inicialización
```bash
docker-compose logs backend | grep "Database"
```

Deberías ver:
```
Database already contains X questions. No initialization needed.
```

### ✅ Confirmación de Persistencia

Si ves este mensaje en los logs después de un reinicio:
```
Database already contains X questions. No initialization needed.
```

¡Tu base de datos está funcionando correctamente y es persistente! 🎉

