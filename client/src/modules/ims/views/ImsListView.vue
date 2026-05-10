<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { InventoryItem } from '@opensteward/shared'
import { useInventoryItems } from '../composables/useInventoryItems'

const { items, loading, error, load, create, update, adjust, remove } = useInventoryItems()

const showForm = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref<string | null>(null)
const adjustError = ref<string | null>(null)
const adjustSteps = reactive<Record<string, number>>({})

const form = ref({ name: '', quantity: 0, unit: '', description: '', category: '' })

function stepFor(id: string): number {
  if (!(id in adjustSteps)) adjustSteps[id] = 1
  return adjustSteps[id]
}

async function doAdjust(id: string, direction: 1 | -1) {
  adjustError.value = null
  try {
    await adjust(id, direction * stepFor(id))
  } catch (e) {
    adjustError.value = e instanceof Error ? e.message : 'Could not adjust quantity.'
  }
}

function openCreate() {
  editingId.value = null
  form.value = { name: '', quantity: 0, unit: '', description: '', category: '' }
  formError.value = null
  showForm.value = true
}

function openEdit(item: InventoryItem) {
  editingId.value = item.id
  form.value = {
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    description: item.description ?? '',
    category: item.category ?? '',
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
      quantity: Number(form.value.quantity),
      unit: form.value.unit,
      description: form.value.description || undefined,
      category: form.value.category || undefined,
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
  if (confirm('Delete this item?')) await remove(id)
}

onMounted(load)
</script>

<template>
  <div class="view">
    <div class="view-header">
      <h1>Inventory</h1>
      <button class="btn-primary" @click="openCreate">+ Add Item</button>
    </div>

    <div v-if="showForm" class="form-panel">
      <h2>{{ editingId ? 'Edit Item' : 'New Item' }}</h2>
      <form @submit.prevent="submit">
        <div class="form-row">
          <label>Name <span class="required">*</span></label>
          <input v-model="form.name" required />
        </div>
        <div class="form-row">
          <label>Quantity <span class="required">*</span></label>
          <input v-model="form.quantity" type="number" step="any" min="0" required />
        </div>
        <div class="form-row">
          <label>Unit <span class="required">*</span></label>
          <input v-model="form.unit" placeholder="e.g. kg, pcs, L" required />
        </div>
        <div class="form-row">
          <label>Category</label>
          <input v-model="form.category" />
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
    <p v-if="adjustError" class="error">{{ adjustError }}</p>
    <p v-if="loading" class="muted">Loading…</p>

    <template v-else>
      <table v-if="items.length">
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Category</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.name }}</td>
            <td>
              <div class="qty-value">{{ item.quantity }}</div>
              <div class="qty-adj">
                <button class="adj" title="Decrease" @click="doAdjust(item.id, -1)">−</button>
                <input
                  class="adj-step"
                  type="number"
                  min="0"
                  step="any"
                  :value="stepFor(item.id)"
                  @change="adjustSteps[item.id] = Math.max(0, Number(($event.target as HTMLInputElement).value))"
                />
                <button class="adj" title="Increase" @click="doAdjust(item.id, 1)">+</button>
              </div>
            </td>
            <td>{{ item.unit }}</td>
            <td>{{ item.category ?? '—' }}</td>
            <td class="row-actions">
              <button @click="openEdit(item)">Edit</button>
              <button class="btn-danger" @click="confirmDelete(item.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">
        No items yet. <button class="link" @click="openCreate">Add the first one.</button>
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
.form-row label { font-size: 0.9rem; color: var(--color-text); }
.form-row input { padding: 0.35rem 0.5rem; border: 1px solid var(--color-border); border-radius: 4px; background: var(--color-background); color: var(--color-text); font-size: 0.9rem; width: 100%; }
.form-actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
.required { color: #c00; }

table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
th, td { text-align: left; padding: 0.65rem 0.75rem; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
th { font-weight: 600; font-size: 0.85rem; color: var(--color-text); opacity: 0.7; text-transform: uppercase; letter-spacing: 0.04em; }
tbody tr:hover { background: var(--color-background-soft); }

.qty-value { font-variant-numeric: tabular-nums; margin-bottom: 0.3rem; }
.qty-adj { display: flex; align-items: center; gap: 0.2rem; }
.adj { padding: 0.15rem 0.45rem; font-size: 0.9rem; line-height: 1; min-width: 1.6rem; text-align: center; }
.adj-step {
  width: 3.5rem;
  padding: 0.15rem 0.25rem;
  text-align: center;
  font-size: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
}

.row-actions { display: flex; gap: 0.4rem; }

button { padding: 0.35rem 0.85rem; cursor: pointer; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-text); font-size: 0.875rem; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--color-text); color: var(--color-background); border-color: var(--color-text); }
.btn-danger { color: #c00; border-color: #fca5a5; }
.btn-danger:hover { background: #fef2f2; }
.link { background: none; border: none; color: var(--vt-c-indigo); cursor: pointer; padding: 0; text-decoration: underline; }

.error { color: #c00; font-size: 0.9rem; }
.muted { color: var(--color-text); opacity: 0.5; }
</style>
