# Kubernetes Deployment para Jeopardy Trivia

Este directorio contiene los manifiestos de Kubernetes para desplegar la aplicación Jeopardy Trivia en un cluster de Kubernetes.

## Estructura de Archivos

- `namespace.yaml` - Namespace para la aplicación
- `configmap.yaml` - Configuración de la aplicación
- `questions-configmap.yaml` - Preguntas del juego
- `pvc.yaml` - Persistent Volume Claim para datos
- `backend-deployment.yaml` - Deployment y Service del backend
- `frontend-deployment.yaml` - Deployment y Service del frontend
- `ingress.yaml` - Ingress con nginx controller
- `kustomization.yaml` - Configuración de Kustomize

## Prerrequisitos

1. **Cluster de Kubernetes** funcionando
2. **Nginx Ingress Controller** instalado
3. **Storage Class** configurado (por defecto: `standard`)
4. **Imágenes Docker** construidas y disponibles:
   - `jeopardy-backend:latest`
   - `jeopardy-frontend:latest`

## Despliegue

### Opción 1: Usando kubectl

```bash
# Aplicar todos los manifiestos
kubectl apply -f k8s/

# Verificar el estado
kubectl get all -n jeopardy
kubectl get ingress -n jeopardy
```

### Opción 2: Usando Kustomize

```bash
# Aplicar con Kustomize
kubectl apply -k k8s/

# Verificar el estado
kubectl get all -n jeopardy
```

## Configuración

### Variables de Entorno

Las variables se configuran en `configmap.yaml`:

- `DATABASE_URL`: URL de la base de datos SQLite
- `NEXT_PUBLIC_API_URL`: URL del backend para el frontend

### Ingress

El ingress está configurado para:
- **Host**: `jeopardy.example.com` (cambiar por tu dominio)
- **Rutas**:
  - `/api/*` → Backend (puerto 8000)
  - `/ws/*` → WebSocket del Backend
  - `/*` → Frontend (puerto 3000)

### Persistencia

- **PVC**: `jeopardy-data` (1Gi)
- **Storage Class**: `standard`
- **Access Mode**: `ReadWriteOnce`

## Escalado

```bash
# Escalar backend
kubectl scale deployment jeopardy-backend --replicas=3 -n jeopardy

# Escalar frontend
kubectl scale deployment jeopardy-frontend --replicas=3 -n jeopardy
```

## Monitoreo

```bash
# Ver logs del backend
kubectl logs -f deployment/jeopardy-backend -n jeopardy

# Ver logs del frontend
kubectl logs -f deployment/jeopardy-frontend -n jeopardy

# Ver estado de los pods
kubectl get pods -n jeopardy -o wide

# Ver servicios
kubectl get svc -n jeopardy
```

## Troubleshooting

### Problemas Comunes

1. **Pods no inician**:
   ```bash
   kubectl describe pod <pod-name> -n jeopardy
   ```

2. **Ingress no funciona**:
   ```bash
   kubectl get ingress -n jeopardy
   kubectl describe ingress jeopardy-ingress -n jeopardy
   ```

3. **Problemas de conectividad**:
   ```bash
   kubectl port-forward svc/jeopardy-backend 8000:8000 -n jeopardy
   kubectl port-forward svc/jeopardy-frontend 3000:3000 -n jeopardy
   ```

### Verificar Nginx Ingress Controller

```bash
# Verificar que nginx controller esté funcionando
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

## Limpieza

```bash
# Eliminar todos los recursos
kubectl delete -f k8s/

# O usando Kustomize
kubectl delete -k k8s/
```

## Personalización

### Cambiar Dominio

Editar `ingress.yaml`:
```yaml
spec:
  rules:
  - host: tu-dominio.com  # Cambiar aquí
```

### Cambiar Storage Class

Editar `pvc.yaml`:
```yaml
spec:
  storageClassName: tu-storage-class  # Cambiar aquí
```

### Cambiar Recursos

Editar `backend-deployment.yaml` y `frontend-deployment.yaml`:
```yaml
resources:
  requests:
    memory: "512Mi"  # Cambiar según necesidades
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```
