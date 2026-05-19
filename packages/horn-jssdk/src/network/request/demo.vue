<template>
  <hor-cell-group inset>
    <component
      v-for="(item, key) in objForm"
      :key="key"
      :is="item.is"
      :label="key"
      @click="handleTransfer(item)"
      v-bind="item"
      v-model="item.value"
    >
      <template #suffix v-if="key === 'url'">
        <van-icon @click="handleScanCode(item)" name="scan" size="20" style="margin-left: 10px" />
      </template>
      <template #label v-if="['data', 'header'].includes(key)">
        <span>{{ key }}</span>
        <van-icon @click="handleScanCode(item)" name="scan" size="20" style="margin-left: auto" />
      </template>
      <template #default v-if="key === 'timeout'">
        <van-stepper v-model="item.value" />
      </template>
      <template #default v-else-if="['data', 'header'].includes(key)">
        <textarea
          class="c-textarea"
          :placeholder="item.placeholder"
          v-model="item.value"
        ></textarea>
      </template>
    </component>
  </hor-cell-group>

  <div style="margin: 32px">
    <van-button @click="handleTest" round block type="primary">测试</van-button>
  </div>

  <dl class="c-result">
    <dt>请求返回结果：</dt>
    <dd>{{ result }}</dd>
  </dl>

  <hor-picker ref="horPickerRef" />
</template>

<script setup lang="ts">
  import { reactive, ref, shallowRef } from 'vue'
  import { showLoadingToast } from 'vant'
  import { HorCell, HorPicker, HorPickerInstance, HorCellGroup, HorField } from '@daysnap/horn-ui'
  import { useTransfer } from '@pkstar/vue-use'
  import { banana } from '@pkstar/banana'
  import { request } from './index'
  import { scanCode } from '../../device'

  const handleTransfer = useTransfer()

  const horPickerRef = ref<HorPickerInstance>()

  const handleScanCode = async (item: any) => {
    const { result } = await scanCode()
    item.value = result
  }

  const objForm = reactive({
    url: {
      value: 'https://www.pkstar.com/evaluate/fastValuation?t=1668577260371&orderId=73469',
      is: shallowRef(HorField),
      clearable: true,
      required: true,
      placeholder: '请输入请求URL',
      rules: [{ required: true, message: '请输入请求URL' }],
    },
    method: {
      value: 'GET',
      is: shallowRef(HorCell),
      arrow: true,
      clearable: true,
      fn: async (item: any) => {
        const { value } = await horPickerRef.value.show({
          value: item.value,
          columns: ['GET', 'POST', 'OPTIONS', 'HEAD', 'PUT', 'DELETE', 'TRACE', 'CONNECT'].map(
            (item) => ({ text: item, value: item }),
          ),
        })
        item.value = value
      },
    },
    timeout: {
      value: 60,
      is: shallowRef(HorCell),
      get: (v: any) => v * 1000,
    },
    data: {
      value: '',
      is: shallowRef(HorCell),
      placeholder: '请输入请求参数',
      direction: 'column',
      get: (v: any) => {
        return { data: JSON.parse(v || '{}') }
      },
      rules: [
        {
          rule: (v: any) => {
            if (!v) return true
            try {
              JSON.parse(v)
            } catch {
              return false
            }
            return true
          },
          message: '请求参数有误，请填入正确JSON',
        },
      ],
    },
    header: {
      value: '',
      is: shallowRef(HorCell),
      placeholder: '请输入请求头',
      direction: 'column',
      get: (v: any) => {
        return { header: JSON.parse(v || '{}') }
      },
      rules: [
        {
          rule: (v: any) => {
            if (!v) return true
            try {
              JSON.parse(v)
            } catch {
              return false
            }
            return true
          },
          message: '请求头设置有误，请填入正确JSON',
        },
      ],
    },
  })

  const result = ref()
  const handleTest = async () => {
    const { url, ...rest } = banana.validate(objForm)
    const toast = showLoadingToast({ duration: 0 })
    result.value = await request({
      url,
      ...rest,
    })
    toast.close()
  }
</script>
