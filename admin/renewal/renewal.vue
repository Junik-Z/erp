<script>
import mixins from "@/mixins/mixins";
import { createOrderApi, queryOrderApi } from "@/api/admin";
import { _isEqual } from "@/utils";
import Dayjs from "@/utils/dayjs";

export default {
  name: "renewal",
  mixins: [mixins],
  data() {
    return {
      isCheck: false,
      scrollTop: 0,
      loading: false,

      option: {},

      isCnc: false,

      orderType: "NORMAL",
    };
  },
  onLoad(option) {
    // type=CUSTOM_CNC
    this.option = option;
    this.isCnc = _isEqual(option.type, "CUSTOM_CNC");

    if (this.isCnc) {
      this.orderType = "CUSTOM_CNC";
    }

    if (!Dayjs(this.GET_CONFIG_INFO?.date).isSame(Dayjs(), "d")) {
      uni.$emit("$__get_all_info__");
    }
  },
  methods: {
    onApply() {
      this.loading = true;

      createOrderApi({orderType: this.orderType})
        .then(res => {
          this.onPay(res.data);
        })
        .catch(() => {
          this.loading = false;
        });
    },
    onChange() {
      this.isCheck = !this.isCheck;
    },

    onToTop() {
      this.scrollTop = this.scrollTop ? 0 : 1;
    },

    // 发起支付
    onPay(res) {
      this.retry = 0;
      /*  const orderInfo = {
         "appid": res.result.appId,
         "noncestr": res.result.nonceStr,
         "package": res.result.packageValue, // 固定值
         "partnerid": res.result.partnerId, // 微信支付商户号
         "prepayid": res.result.prepayId,
         "timestamp": res.result.timeStamp,
         "sign": res.result.paySign1,

       }; */

      uni.requestPayment({
        // #ifdef MP-WEIXIN || H5
        provider: "wxpay",
        timeStamp: res.result.timeStamp,
        nonceStr: res.result.nonceStr,
        package: res.result.packageValue,
        signType: res.result.signType,
        paySign: res.result.paySign,
        // #endif

        // #ifdef MP-TOUTIAO
        // provider: 'toutiao',
        // service: 5,
        // orderInfo: data.result,
        // #endif

        // #ifdef APP
        // provider: 'wxpay',
        // orderInfo: orderInfo,
        // #endif
        success: (q) => {
          console.log("微信支付成功了:", q);
          this.getQueryOrder(res.orderNo);
          this.loading = false;
        },
        fail: (err) => {
          this.loading = false;

          console.log("微信支付失败了:", err);
          /* uni.showModal({
                 title: '提示',
                 content: 'fail:' + JSON.stringify(err)
               }) */
          uni.showToast({
            icon: "error",
            duration: 3000,
            title: "已取消支付",
          });
        },
      });
    },

    // 查询支付状态
    getQueryOrder(orderId) {
      const direct = (this.retry % 3 === 0);
      this.retry += 1;

      return new Promise((resolve, reject) => {
        queryOrderApi({orderCode: orderId, direct})
          .then(res => {
            const data = res;

            if (_isEqual(data, "SUCCESS")) {
              uni.showToast({
                icon: "success",
                duration: 3000,
                title: "支付成功",
              });

              this.onSuccess();
              resolve();
            } else if (_isEqual(data, "CANCEL")) {
              uni.showToast({
                icon: "error",
                duration: 3000,
                title: "取消支付",
              });
              reject("取消支付");
            } else if (this.retry > 12) {
              this.retry = 0;
              uni.showToast({
                icon: "error",
                duration: 3000,
                title: "支付超时",
              });
              reject("支付超时");
            } else {
              setTimeout(() => {
                this.getQueryOrder(orderId).then(resolve).catch(reject);
              }, 2000);
            }
          });
      });
    },

    // 支付成功
    onSuccess() {
      uni.showModal({
        title: "您的SaaS服务支付已成功完成！🎉🎉🎉",
        content: `感谢您选择我们的服务，我们将竭诚为您打造高效、智能的软件体验。您的账户已激活，即刻起即可畅享所有功能。如有任何疑问或需要帮助，请随时联系我们的商务人员。再次感谢您的信任与支持，祝您使用愉快！`,
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            this.onLogout({});
          }
        },
      });
    },
  },
  computed: {
    startTime() {
      const {validDate, date} = this.GET_CONFIG_INFO || {};

      if (validDate && date) {
        const V = Dayjs(validDate);
        let D = Dayjs(date);

        // 判断是否过期了， V 是不是在 D 之前，
        const isExpired = V.isBefore(D, "day");

        if (!isExpired) {
          D = Dayjs(validDate);
        }

        const E = D.add(1, "y").subtract(1, "d");
        return {
          YYYY: D.year(),
          MM: D.month() + 1,
          DD: D.date(),

          E_Y: E.year(),
          E_M: E.month() + 1,
          E_D: E.date(),
        };

      } else {
        return {};
      }
    },
    softwareName() {
      return {
        NORMAL: "托手掌柜SAAS软件",
        CUSTOM_CNC: "托手掌柜板材定制功能",
      }[this.orderType];
    },
  },
};
</script>

<template>
  <view class="ko-renewal">
    <scroll-view
      id="SVRef"
      style="height: 100%;"
      scroll-y="true"
      :scroll-top="scrollTop"
      scroll-with-animation
    >
      <view class="ko-renewal__contract">
        <view class="h1" id="header">{{ softwareName }}服务合同</view>
        <view class="stage" style="margin-top: 10px;">
          <view style="margin-bottom: 5px;">
            甲方：
            <label style="width: 200px; border-bottom: 1rpx solid #000; display: inline-block;padding: 0 20px;">
              {{ GET_SHOP_NAME }}
            </label>
          </view>
          <view>
            乙方：
            <label style="width: 200px; border-bottom: 1rpx solid #000; display: inline-block;padding: 0 20px;">
              赣州市夸欧科技有限公司
            </label>
          </view>
        </view>
        <view class="stage indent">
          甲乙双方经友好协商，就乙方向甲方提供<label class="underline"> {{ softwareName }} </label>软件服务支持及相关互联网商业服务事宜，达成如下协议：
        </view>

        <view class="h2">
          一、服务内容
        </view>
        <view class="stage indent" style="--ko-basic-table-grid-col: 6em auto 5em">
          <view>
            甲方同意按照以下服务选择支付<label class="underline"> 互联网商业服务费用</label>：
          </view>
          <view>
            1、甲方向乙方购买软件服务清单、服务标准费用如下：
          </view>

          <view class="ko-renewal__contract--table">
            <view class="ko-basic-table">
              <view class="ko-basic-table--th">功能模块</view>
              <view class="ko-basic-table--th">功能描述</view>
              <view class="ko-basic-table--th">版本</view>

              <block v-if="isCnc">
                <view class="ko-basic-table--cell">板材定制</view>
                <view class="ko-basic-table--cell">
                  <view class="table-desc">
                    实现批量定制板材的智能生产加工，通过材料自动计算与自动排版，精准优化材料利用率。同时，系统控制机械操作，实现全流程智能化生产，提升效率与质量。
                  </view>
                </view>
                <view class="ko-basic-table--cell">定制</view>
              </block>

              <block v-else>
                <view class="ko-basic-table--cell">库存</view>
                <view class="ko-basic-table--cell">
                  <view class="table-desc">
                    库存功能提供出入库管理、库存盘点、数据分析，帮助高效管理和优化库存水平。
                  </view>
                </view>
                <view class="ko-basic-table--cell">SAAS</view>

                <view class="ko-basic-table--cell">销售</view>
                <view class="ko-basic-table--cell">
                  <view class="table-desc">
                    销售功能支持快速下单、分享下单与客户管理，提升销售效率和客户体验。
                  </view>
                </view>
                <view class="ko-basic-table--cell">SAAS</view>

                <view class="ko-basic-table--cell">采购</view>
                <view class="ko-basic-table--cell">
                  <view class="table-desc">
                    采购功能支持便捷下单、分享下单与供应商管理，助力高效采购流程和成本控制。
                  </view>
                </view>
                <view class="ko-basic-table--cell">SAAS</view>

                <view class="ko-basic-table--cell">生产</view>
                <view class="ko-basic-table--cell">
                  <view class="table-desc">
                    生产模块涵盖数据统计、员工管理、生产流程管控及工资计算等功能，助力企业高效生产与精细化管理。
                  </view>
                </view>
                <view class="ko-basic-table--cell">SAAS</view>

                <view class="ko-basic-table--cell">财务</view>
                <view class="ko-basic-table--cell">
                  <view class="table-desc">
                    财务模块具备应收款、应付款管理，成本统计与款项核对等功能，助力企业精准把控财务状况。
                  </view>
                </view>
                <view class="ko-basic-table--cell">SAAS</view>

                <view class="ko-basic-table--cell">配送</view>
                <view class="ko-basic-table--cell">
                  <view class="table-desc">
                    配送模块支持配送任务管理、物流商对接与跟踪，优化配送流程，提升物流效率。
                  </view>
                </view>
                <view class="ko-basic-table--cell">SAAS</view>

                <view class="ko-basic-table--cell">产品管理</view>
                <view class="ko-basic-table--cell">
                  <view class="table-desc">
                    产品模块提供产品管理、分类管理及扩展字段设置，助力高效组织与优化产品信息。
                  </view>
                </view>
                <view class="ko-basic-table--cell">SAAS</view>

                <view class="ko-basic-table--cell">员工管理</view>
                <view class="ko-basic-table--cell">
                  <view class="table-desc">
                    员工管理模块支持授权员工和细化权限，灵活分配角色与功能权限，保障系统操作安全与高效。
                  </view>
                </view>
                <view class="ko-basic-table--cell">SAAS</view>

                <view class="ko-basic-table--cell">考勤</view>
                <view class="ko-basic-table--cell">
                  <view class="table-desc">
                    考勤模块支持考勤记录查询、扫码打卡功能，实时统计出勤数据，便捷高效管理考勤。
                  </view>
                </view>
                <view class="ko-basic-table--cell">SAAS</view>
              </block>

            </view>
          </view>

          <view>
            2、甲方使用期限为：
            <label class="underline">{{ startTime.YYYY }}</label>
            年
            <label class="underline">{{ startTime.MM }}</label>
            月
            <label class="underline">{{ startTime.DD }}</label>
            日至
            <label class="underline">{{ startTime.E_Y }}</label>
            年
            <label class="underline">{{ startTime.E_M }}</label>
            月
            <label class="underline">{{ startTime.E_D }}</label>
            日，共计
            <label class="underline">1</label>
            年。
          </view>
        </view>

        <view class="h2">
          二、合同金额
        </view>
        <view class="stage indent">
          1、本合同总金额为
          <label class="underline">1000</label>
          元，大写：
          <!-- <label class="underline"></label>
           佰
           <label class="underline"></label>
           拾
           <label class="underline"></label>
           万-->
          <label class="underline">壹</label>
          千
          <!-- <label class="underline"></label>
           佰
           <label class="underline"></label>
           拾
           <label class="underline"></label>-->
          元整。
        </view>

        <view class="h2">
          三、付款方式
        </view>
        <view class="stage indent">
          合同签订时，视为验收成果，甲方需一次性付清合同全部款项。
        </view>

        <view class="h2">
          四、软件版权与数据归属
        </view>
        <view class="stage indent">
          <view>
            1、本软件的著作权归乙方所有，并受到《中华人民共和国著作权法》以及其他相关法律法规的保护。甲方不得以任何形式对软件进行解密或破解。
          </view>
          <view>
            2、甲方在使用过程中产生的衍生数据（如分析报告、统计数据等）所有权归乙方所有，甲方仅享有使用权。
          </view>
        </view>

        <view class="h2">
          五、{{ softwareName }}服务使用条款
        </view>
        <view class="stage indent">
          <view>
            1、甲方同意严格遵循乙方的{{ softwareName }}服务条款。在本合同规定的期限内，甲方仅拥有{{
              softwareName
            }}软件的使用权及相关服务。未经乙方书面许可，甲方不得将该软件用于超出本协议约定的任何用途。
          </view>
          <view>
            2、甲方应当合法使用 托手掌柜SAAS
            软件服务，不得利用该产品进行侵权、违法、违规和违反本协议目的之行为，否则乙方有权单方终止甲方对该产品的使用许可，乙方不承担任何责任，并且乙方有权不退还甲方已支付的费用。
          </view>
          <view>
            3、未经乙方书面授权，甲方不得将 托手掌柜SAAS 软件及对应账号以任何有偿或无偿的方式进行转让、赠与，或允许第三方企业使用。甲方应妥善保管账号信息，防止未经授权的使用。
          </view>
          <view>
            4、甲方同意乙方有权根据业务发展需要，对产品服务地址、功能升级、数据参数、使用方式等进行调整和优化。甲方需要留意系统公告，以获取相关调整内容，但甲方理解并同意，乙方不保证调整过程中的绝对无间断服务。
          </view>
          <view>
            5、乙方将在甲方合同约定的服务到期前30个工作日内进行软件内置提醒。甲方应在服务期限到期前及时备份相关数据，并根据需要办理续费手续，以确保软件服务的连续性。
          </view>
          <view>
            6、甲方所使用的 托手掌柜SAAS
            软件账户到期后15日内，甲方应明确是否继续使用该服务。如甲方决定不再继续使用，需明确告知乙方是否清空或导出账户系统数据(乙方仅提供数据库结构的CSV格式的数据导出服务，定制化导出需另行付费)。逾期未处理的，乙方将发送最终通知，若甲方3日内未回复，乙方有权清空数据。
          </view>
          <view>
            7、甲方在使用 托手掌柜SAAS 软件过程中与第三方发生的任何纠纷，以及由此导致的经济或法律责任，均与乙方无关。甲方应自行承担相关后果，并确保乙方免受任何损失。
          </view>
          <view>
            8、若因甲方自身原因（包括但不限于授权他人使用、共享账号、泄露登录信息等）导致数据外泄或其他安全问题，乙方不承担任何责任。由此产生的后果由甲方自行承担。
          </view>
        </view>

        <view class="h2">
          六、甲方责任
        </view>
        <view class="stage indent">
          <view>
            1、甲方同意并接受本服务合同的相关规定。甲方承诺提供的信息中不包含任何违反法律法规，或侵犯第三方权益的内容，否则乙方有权终止为甲方提供关于
            托手掌柜SAAS 软件的一切服务支持。
          </view>
          <view>
            2、甲方应保证所提供的公司名称，与营业执照或公司证明的名称一致，并承诺营业执照及相关证件真实有效，授权代表已经依法取得了甲方授权，有权代表甲方签署本合同。
          </view>
          <view>
            3、甲方应建立计算机系统运行维护制度，以确保系统（包括软件、计算机、打印机及相关硬件设备）的安全，为计算机系统的正常运行提供保障,若因甲方操作不当（包含但不限于如密码泄露,token泄露等）导致数据损失，乙方不承担责任。
          </view>
          <view>
            4、甲方在应用操作过程中发现软件出现异常，应及时与乙方取得联系，并记录当前故障现象，以便乙方及时判断进行维护工作。
          </view>
        </view>

        <view class="h2">
          七、乙方责任
        </view>
        <view class="stage indent">
          <view>
            1、乙方应参照本软件服务合同及相关服务条款，同时向甲方进行解释说明 托手掌柜SAAS 软件系统的功能。
          </view>
          <view>
            2、乙方应采取相应的管理、物理及技术措施保护甲方使用软件服务器数据的安全性、私密性和完整性。
          </view>
          <view>
            3、乙方承诺若甲方停止使用该产品，乙方有义务为甲方导出甲方账号中的系统数据，并提供给甲方，并承诺对第三方保密。
          </view>
          <view>
            4、乙方承诺为甲方提供软件售后服务和软件日常维护工作，乙方应优先选择具备资质的第三方服务商保证软件的正常运行与使用。
          </view>
        </view>

        <view class="h2">
          八、保密义务
        </view>
        <view class="stage indent">
          一方必须严格保守对因本合同项下的服务自另一方所获取的商业秘密，在未取得另一方书面同意的情况下，不得以任何形式向第三方披露。
        </view>

        <view class="h2">
          九、违约责任
        </view>
        <view class="stage indent">
          甲乙双方应秉持诚信原则，正当行使权利并全面履行义务，以确保本合同的顺利执行。任何一方未能充分、及时履行本合同项下的义务，均应承担相应的违约责任。
        </view>

        <view class="h2">
          十、适用法律与争议之解决
        </view>
        <view class="stage indent">
          本合同签署后，对于因本合同的履行产生的争议，双方通过友好协商解决：协商不成时，任何一方均有权提交赣州仲裁委员会仲裁，或根据相关法律法规诉至人民法院。
        </view>

        <view class="h2">
          十一、免责条件
        </view>
        <view class="stage indent">
          因电信部门检修、国家政策调整、自然灾害等不可抗力因素造成本合同履行中断的，双方互不承担责任。此外，若因云服务厂商的问题（包括但不限于服务中断、技术故障、数据丢失等）导致合同履行中断或延迟，乙方将协助甲方与厂商沟通，但不承担直接赔偿责任。
        </view>

        <view class="h2">
          十二、续费问题
        </view>
        <view class="stage indent">
          甲方使用软件到期需及时续费，具体续费价格以乙方官网公示的市场公允价为准，年涨幅不超过10%。甲方如增加软件产品本身服务之外的功能需求或其它增值服务要求，将视具体内容，由双方另行协商相关费用。
        </view>

        <view class="h2">
          十三、其他
        </view>
        <view class="stage indent">
          <view>
            1、乙方有权对本合同未明确事项进行解释，并以书面形式补充条款。
          </view>
          <view>
            2、本合同构成双方之间完整合同，取代先前所有讨论、协商及协议。
          </view>
          <view>
            3、本合同一式贰份，甲乙双方各执一份，经签字或盖章后生效。
          </view>
          <view>
            4、其他未尽事宜，依据相关法律法规执行。
          </view>
        </view>

        <view style="text-align: center; padding-top: 10px;" v-if="false">
          （以下无合同正文）
        </view>

        <view style="display: flex; align-items: center; margin-top: 20px; color: #8f939c;">
          <radio @click="onChange" :checked="isCheck" style="transform:scale(0.8)" color="#2979ff" />
          <view>
            我已阅读并同意 <label style="color:#2979ff;" @click="onToTop">《{{ softwareName }}服务合同内容》</label>，并确认签署本合同。我知晓签署后本合同具有法律效力，双方需严格履行合同义务。
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="ko-basic-footer">
      <view style="display: flex; justify-content: space-between; align-items: center;">
        <view style="font-size: 12px; color: #8f939c;"></view>
        <button
          class="ko-basic-button__card"
          @click="onApply"
          :disabled="!isCheck || loading"
          :loading="loading"
        >
          付款
        </button>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.ko-renewal {
  width: 100%;
  height: 100vh;

  &__contract {
    padding: 10px 10px 100px;
    font-size: 12px;
    line-height: 1.4;

    &--table {
      padding: 10px 0;
      text-indent: 0;
      // #ifdef H5
      width: 1000px;
      // #endif
    }

    .table-desc {
      text-align: left;
    }

    .h1 {
      font-size: 18px;
      text-align: center;
      font-weight: bold;
    }

    .h2 {
      margin-top: 10px;
      font-size: 14px;
      font-weight: bold;
    }

    .stage {
      padding-top: 10px;
    }

    .indent {
      text-indent: 2em;
    }

    .underline {
      padding: 0 2px;
      text-decoration: underline;
    }
  }
}
</style>
