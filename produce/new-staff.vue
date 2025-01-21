<script>
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import { _deepCopy, CustomToast } from "@/utils";
import { validatePhone } from "@/utils/validate";
import { isNumber } from "@/components/da-tree-vue2/utils";
import { addedStaffApi, editStaffApi, getStaffInfoApi } from "@/api/erp/product";

export default {
  name: "NewStaff",
  components: {
    FilePicker,
    BasicPopup,
    UniForms,
    BasicCard,
    UniSection,
    UniFormsItem,
    UniCol,
    UniEasyinput,
    UniRow,
  },
  data: () => ({
    form: {
      "name": "",
      "logo": "",
      "address": "",
      "contacts": [],
      "invoiceTitle": "",
      "taxNumber": "",
      "bank": "",
      "bankAccount": "",
      "invoiceType": "",
      "taxRate": "",
      "remark": "",
    },
    rules: {
      name: {
        rules: [
          {
            required: true,
            errorMessage: "请填写员工名称",
          },
        ],
        validateTrigger: "submit",
      },
    },
    contactsRules: {
      name: {
        rules: [
          {
            required: true,
            errorMessage: "请填写联系人名称",
          },
        ],
        validateTrigger: "submit",
      },
      phone: validatePhone(),
    },
    visible: false,

    contacts: {
      name: "",
      phone: "",
    },

    loading: false,
    option: {},

    isEdit: false,
    ContactsIndex: null,
  }),
  onLoad(option) {
    this.option = option;
    this.isEdit = !!option.id;

    if (this.isEdit) this.getInfo();

    // #ifdef MP
    this.$nextTick(() => {
      this.$refs.FormRef.setRules(this.rules);
      this.$refs.ContactFormRef.setRules(this.contactsRules);
    });
    // #endif
  },
  methods: {
    // 获取客户详情
    getInfo() {
      getStaffInfoApi({id: this.option.id})
        .then(res => {
          this.form = res.data;
        });
    },

    // 添加联系人
    addContacts(row, index) {
      this.ContactsIndex = index;
      this.contacts = {..._deepCopy(this.$options.data().contacts), ...row};
      this.visible = true;


      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.ContactFormRef.setRules(this.contactsRules);
        }, 30);
      });
    },
    // 添加联系人
    addedFormContacts() {
      this.$refs.ContactFormRef.validate((valid) => {
        if (!valid) {
          if (isNumber(this.ContactsIndex)) {
            this.form.contacts[this.ContactsIndex] = _deepCopy(this.contacts);
          } else {
            this.form.contacts.push(_deepCopy(this.contacts));
          }
          this.visible = false;
        }
      });
    },

    onSubmit() {
      this.$refs.FormRef.validate((valid) => {
        if (!valid) {
          const Func = this.isEdit ? editStaffApi : addedStaffApi;

          const params = _deepCopy(this.form);
          this.loading = true;
          Func(params)
            .then(async (res) => {
              CustomToast({
                title: `${this.isEdit ? "编辑" : "新增"}成功`,
                success() {
                  uni.navigateBack({});
                },
              });
            })
            .finally(() => {
              this.loading = false;
            })
          ;
        }
      });
    },
  },
};
</script>

<template>
  <view class="ko-client ko-basic-added-form">
    <UniForms
      :rules="rules"
      ref="FormRef"
      :model="form"
      label-width="120px"
      label-align="right"
    >
      <UniSection title="基础信息" type="line">
        <view style="padding: 10px;">
          <UniFormsItem label="员工名称：" name="name">
            <UniEasyinput v-model="form.name" placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="头像：" name="logo">
            <FilePicker v-model="form.logo" />
          </UniFormsItem>
          <UniFormsItem label="详细地址：" name="address">
            <UniEasyinput v-model="form.address" placeholder="请输入" />
          </UniFormsItem>
        </view>
      </UniSection>

      <UniSection title="联系人信息" type="line" v-if="false">
        <view style="padding: 10px;">
          <BasicCard v-for="(item, index) of form.contacts" :key="index" :spacing="10">
            <UniRow class="ko-verify__item">
              <UniCol :span="12">
                <label class="ko-basic-label">联系人：</label>
                {{ item.name }}
              </UniCol>
              <UniCol :span="12">
                <label class="ko-basic-label">手机号：</label>
                {{ item.phone }}
              </UniCol>
            </UniRow>
            <view
              style="display: flex; align-items: center; justify-content: flex-end; margin-top: 8px;"
            >
              <button class="ko-basic-button__card" style="margin-right: 10px;" @click="addContacts(item, index)">修改
              </button>
              <button class="ko-basic-button__card" @click="form.contacts.splice(index, 1)">移除</button>
            </view>
          </BasicCard>

          <view style="display: flex; align-items: center; margin-top: 8px;">
            <button class="ko-basic-button__card" @click="addContacts({}, '')">添加</button>
          </view>
        </view>
      </UniSection>

      <UniSection title="财务信息" type="line">
        <view style="padding: 10px;">
          <!--<UniFormsItem label="发票抬头：" name="invoiceTitle">
            <UniEasyinput v-model="form.invoiceTitle" placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="发票税号：" name="taxNumber">
            <UniEasyinput v-model="form.taxNumber" placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="税种：" name="invoiceType">
            <UniEasyinput v-model="form.invoiceType" placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="增值税税率：" name="taxRate">
            <UniEasyinput v-model="form.taxRate" placeholder="请输入" />
          </UniFormsItem>-->
          <UniFormsItem label="银行：" name="bank">
            <UniEasyinput v-model="form.bank" placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="银行账号：" name="bankAccount">
            <UniEasyinput v-model="form.bankAccount" placeholder="请输入" />
          </UniFormsItem>
        </view>
      </UniSection>
    </UniForms>

    <button
      class="ko-basic-button"
      style="margin: 0 40px 10px;"
      :loading="loading"
      :disabled="loading"
      @click="onSubmit"
    >
      保存
    </button>

    <BasicPopup :visible.sync="visible">
      <view class="ko-client__popup">
        <UniForms
          :model="contacts"
          label-width="110px"
          :rules="contactsRules"
          ref="ContactFormRef"
        >
          <UniFormsItem label="联系人姓名：" name="name" required>
            <UniEasyinput v-model="contacts.name" placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="手机号：" name="phone" required>
            <UniEasyinput type="number" v-model="contacts.phone" placeholder="请输入" />
          </UniFormsItem>
        </UniForms>

        <button class="ko-basic-button" style="margin: 0 40px 10px;" @click="addedFormContacts">保存</button>
      </view>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-client {
  padding-bottom: 80px;

  // #ifdef H5
  .ko-basic-button {
    margin: 0 auto !important;
  }

  &__popup {
    width: 100%;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }

  // #endif

  // #ifdef MP
  &__popup {
    width: 90vw;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }

  // #endif
}
</style>
