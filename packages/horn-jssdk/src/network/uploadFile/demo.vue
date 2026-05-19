<template>
  <hor-cell-group>
    <component
      v-for="(item, key) in objForm"
      :key="key"
      :is="item.is"
      @click="handleTransfer(item)"
      :label="key"
      v-bind="item"
      v-model="item.value"
    >
      <template #suffix v-if="key === 'url'">
        <van-icon @click="handleScanCode(item)" name="scan" size="20" style="margin-left: 10px" />
      </template>
      <template #label v-if="['formData', 'header'].includes(key)">
        <span>{{ key }}</span>
        <van-icon @click="handleScanCode(item)" name="scan" size="20" style="margin-left: auto" />
      </template>
      <template #default v-if="key === 'timeout'">
        <van-stepper v-model="item.value" />
      </template>
      <template #default v-else-if="['formData', 'header'].includes(key)">
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
    <dt>{{ result }}</dt>
  </dl>

  <hor-action-sheet ref="horActionsSheetRef" />
</template>

<script setup lang="ts">
  import { reactive, ref, shallowRef } from 'vue'
  import { showLoadingToast, showToast } from 'vant'
  import {
    HorCell,
    HorCellGroup,
    HorActionSheet,
    HorActionSheetInstance,
    HorField,
  } from '@daysnap/horn-ui'
  import { useTransfer } from '@pkstar/vue-use'
  import { banana } from '@pkstar/banana'
  import { chooseImage, chooseVideo } from '../../media'
  import { uploadFile } from './index'
  import { scanCode } from '../../device'

  const handleTransfer = useTransfer()

  const handleScanCode = async (item: any) => {
    const { result } = await scanCode()
    item.value = result
  }

  const horActionsSheetRef = ref<HorActionSheetInstance>()
  const objForm = reactive<Record<string, any>>({
    url: {
      value: 'https://www.pkstar.com/certificateBosOrder/imageFileUpload',
      is: shallowRef(HorField),
      placehorlder: '请输入上传地址',
      required: true,
      rules: [{ required: true, message: '请输入上传地址' }],
    },
    filePath: {
      value: '',
      is: shallowRef(HorCell),
      required: true,
      arrow: true,
      fn: async (item: any) => {
        const { value, type } = await horActionsSheetRef.value.show({
          actions: [
            {
              name: '相册选择图片',
              value: 'album',
              type: 'image',
            },
            {
              name: '相机拍摄图片',
              value: 'camera',
              type: 'image',
            },
            {
              name: '相册选择视频',
              value: 'album',
              type: 'video',
            },
            {
              name: '相机拍摄视频',
              value: 'camera',
              type: 'video',
            },
          ],
        })
        const sourceType = [value]
        const toast = showLoadingToast({ duration: 0 })
        if (type === 'image') {
          const { tempFilePaths } = await chooseImage({
            count: 1,
            sourceType,
          })
          item.value = tempFilePaths[0]
        } else {
          const { tempFilePaths } = await chooseVideo({
            count: 1,
            sourceType,
          })
          item.value = tempFilePaths[0]
        }
        toast.close()
      },
      rules: [{ required: true, message: '请选择本地文件' }],
    },
    name: {
      value: 'imageFile',
      is: shallowRef(HorField),
      placehorlder: '请输入文件对应的key',
      required: true,
      clearable: true,
      rules: [{ required: true, message: '请输入文件对应的key' }],
    },
    timeout: {
      value: 60,
      is: shallowRef(HorCell),
      get: (v: any) => v * 1000,
    },
    formData: {
      value: JSON.stringify({
        imageRate: '750X750',
      }),
      is: shallowRef(HorCell),
      placeholder: '请输入请求参数',
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
    const { url, filePath, name } = banana.validate(objForm)
    const toast = showLoadingToast({ duration: 0, message: '上传中...' })
    result.value = await uploadFile({ url, filePath, name })
    toast.close()
    showToast('上传成功')
  }
</script>
