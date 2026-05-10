<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Asset, AssetStatus } from '@opensteward/shared'
import { useAssets } from '../composables/useAssets'

const { assets, loading, error, load, create, update, remove } = useAssets()

const showForm = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref<string | null>(null)

const statusOptions: { value: AssetStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'checked-out', label: 'Checked Out' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'retired', label: 'Retired' },
]

const statusLabels = Object.fromEntries(statusOptions.map(o => [o.value, o.label])) as Record<AssetStatus, string>

const form = ref({ name: '', status: 'available' as AssetStatus, description: '', location: '' })

function openCreate() {
  editingId.value = null
  form.value = { name: '', status: 'available', description: '', location: '' }
  formError.value = null
  showForm.value = true
}

function openEdit(asset: Asset) {
  editingId.value = asset.id
  form.value = {
    name: asset.name,
    status: asset.status,
    description: asset.description ?? '',
    location: asset.location ?? '',
  }
  formError.value = null
  showForm.value = true
}

function cancel() {
  showForm.value = false
  editingId.value = null
}

async function submit() {
  saving.value = true
  formError.value = null
  try {
    const input = {
      name: form.value.name,
      status: form.value.status,
      description: form.value.description || undefined,
      location: form.value.location || undefined,
    }
    if (editingId.value) {
      await update(editingId.value, input)
    } else {
      await create(input)
    }
    cancel()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Something went wrong.'
  } finally {
    saving.value = false
  }
}

async function confirmDelete(id: string) {
  if (confirm('Delete this asset?')) await remove(id)
}

onMounted(load)
</script>

<template>
  <div class="view">
    <div class="view-header">
      <h1>Assets</h1>
      <button class="btn-primary" @click="openCreate">+ Add Asset</button>
    </div>

    <div v-if="showForm" class="form-panel">
      <h2>{{ editingId ? 'Edit Asset' : 'New Asset' }}</h2>
      <form @submit.prevent="submit">
        <div class="form-row">
          <label>Name <span class="required">*</span></label>
          <input v-model="form.name" required />
        </div>
        <div class="form-row">
          <label>Status <span class="required">*</span></label>
          <select v-model="form.status">
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div class="form-row">
          <label>Location</label>
          <input v-model="form.location" />
        </div>
        <div class="form-row">
          <label>Description</label>
          <input v-model="form.description" />
        </div>
        <p v-if="formError" class="error">{{ formError }}</p>
        <div class="form-actions">
          <button type="button" @click="cancel">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </form>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">Loading…</p>

    <template v-else>
      <table v-if="assets.length">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Location</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="asset in assets" :key="asset.id">
            <td>{{ asset.name }}</td>
            <td>
              <span class="status-badge" :class="asset.status">
                {{ statusLabels[asset.status] }}
              </span>
            </td>
            <td>{{ asset.location ?? '—' }}</td>
            <td class="row-actions">
              <button @click="openEdit(asset)">Edit</button>
              <button class="btn-danger" @click="confirmDelete(asset.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">
        No assets yet. <button class="link" @click="openCreate">Add the first one.</button>
      </p>
    </template>
  </div>
</template>

<style scoped>
.view { max-width: 960px; margin: 2rem auto; padding: 0 1.5rem; }
.view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
h1 { margin: 0; }

.form-panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.form-panel h2 { margin: 0 0 1rem; font-size: 1rem; }
.form-row { display: grid; grid-template-columns: 130px 1fr; gap: 0.5rem; align-items: center; margin-bottom: 0.6rem; }
.form-row label { font-size: 0.9rem; }
.form-row input, .form-row select { padding: 0.35rem 0.5rem; border: 1px solid var(--color-border); border-radius: 4px; background: var(--color-background); color: var(--color-text); font-size: 0.9rem; width: 100%; }
.form-actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
.required { color: #c00; }

table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
th, td { text-align: left; padding: 0.65rem 0.75rem; border-bottom: 1px solid var(--color-border); }
th { font-weight: 600; font-size: 0.85rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.04em; }
tbody tr:hover { background: var(--color-background-soft); }

.row-actions { display: flex; gap: 0.4rem; }

.status-badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.8rem; font-weight: 500; }
.status-badge.available    { background: #dcfce7; color: #166534; }
.status-badge.checked-out  { background: #fef9c3; color: #854d0e; }
.status-badge.maintenance  { background: #dbeafe; color: #1e40af; }
.status-badge.retired      { background: #f3f4f6; color: #6b7280; }

button { padding: 0.35rem 0.85rem; cursor: pointer; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text); font-size: 0.875rem; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--color-text); color: var(--color-background); border-color: var(--color-text); }
.btn-danger { color: #c00; border-color: #fca5a5; }
.btn-danger:hover { background: #fef2f2; }
.link { background: none; border: none; color: var(--vt-c-indigo); cursor: pointer; padding: 0; text-decoration: underline; }

.error { color: #c00; font-size: 0.9rem; }
.muted { color: var(--color-text); opacity: 0.5; }
</style>
