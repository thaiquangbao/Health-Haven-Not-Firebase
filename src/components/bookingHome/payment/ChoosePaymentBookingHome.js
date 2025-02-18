import React, { useContext, useEffect, useState } from "react";
import { Dimensions, TouchableOpacity } from "react-native";
import { Image, Text, View } from "react-native";
import { formatMoney } from "../../../utils/other";
import { convertDateToDayMonthYear } from "../../../utils/date";
import { userContext } from "../../../contexts/UserContext";
import { payloadContext } from "../../../contexts/PayloadContext";
import { io } from "socket.io-client";
import { api, baseURL, TypeHTTP } from "../../../utils/api";
import { utilsContext } from "../../../contexts/UtilsContext";
import { menuContext } from "../../../contexts/MenuContext";
import { notifyType } from "../../../utils/notify";
const socket = io.connect(baseURL);

const ChoosePayment = ({ setStep }) => {
  const { userData } = useContext(userContext);
  const { width } = Dimensions.get("window");
  const [url, setUrl] = useState("");
  const { payloadData, payloadHandler } = useContext(payloadContext);
  const { utilsHandler } = useContext(utilsContext);
  const { menuHandler } = useContext(menuContext);
  useEffect(() => {
    if (payloadData.bookingHome) {
      setUrl(
        `https://qr.sepay.vn/img?bank=MBBank&acc=0834885704&template=compact&amount=${payloadData.bookingHome?.price_list.price}&des=MaKH${userData.user?._id}2b`
      );
    }
  }, [payloadData.bookingHome, userData.user?._id]);

  useEffect(() => {
    socket.on(`payment-appointment-offline${userData.user?._id}`, (data) => {
      if (data) {
        handleSubmit();
      } else {
        utilsHandler.notify(notifyType.WARNING, "Thanh Toán Thất Bại");
      }
    });
    return () => {
      socket.off(`payment-appointment-offline${userData.user?._id}`);
    };
  }, [userData.user?._id]);

  const handleSubmit = () => {
    if (userData.user) {
      const body = {
        _id: payloadData.bookingHome._id,
        processAppointment: 2,
        status: {
          status_type: "ACCEPTED",
          message: "Bệnh nhân đã thanh toán",
        },
      };
      api({
        path: "/appointmentHomes/payment",
        body,
        sendToken: true,
        type: TypeHTTP.POST,
      }).then((res) => {
        utilsHandler.notify(
          notifyType.SUCCESS,
          "Đã Thanh Toán, Xác Nhận Lịch Hẹn Thành Công"
        );
        setStep(2);
      });
    }
  };

  return (
    <View
      style={{
        width,
        flexDirection: "column",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingTop: 60,
      }}
    >
      <Text style={{ fontFamily: "Nunito-B", fontSize: 20 }}>
        Phương Thức Thanh Toán
      </Text>

      <View
        style={{
          flexDirection: "column",
          gap: 10,
          borderRadius: 5,
          width: "85%",
          borderWidth: 1,
          borderColor: "#cacfd2",
          marginTop: 10,
        }}
      >
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            gap: 5,
            borderRadius: 5,
            width: "100%",
            borderBottomWidth: 1,
            borderColor: "#cacfd2",
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          <Text style={{ fontFamily: "Nunito-S" }}>Thanh Toán Qua Mã QR</Text>
        </View>
        <View
          style={{
            alignItems: "center",
            flexDirection: "column",
            borderRadius: 5,
            width: "100%",
            borderBottomWidth: 1,
            borderColor: "#cacfd2",
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          <Image
            source={{ uri: url }}
            style={{ width: "70%", aspectRatio: 1 }}
          />
          <Text>Tên chủ TK: THAI ANH THU</Text>
          <Text>Số TK: 0834885704</Text>
          <Text style={{ textAlign: "center" }}>
            Sử dụng app Momo hoặc app Ngân hàng để thanh toán
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "column",
          gap: 10,
          borderRadius: 5,
          width: "85%",
          borderWidth: 1,
          borderColor: "#cacfd2",
          marginTop: 10,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            alignItems: "start",
            flexDirection: "row",
            gap: 15,
            borderRadius: 5,
            width: "100%",
            borderBottomWidth: 1,
            borderColor: "#cacfd2",
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          <View
            style={{
              height: 55,
              width: 55,
              borderWidth: 1,
              borderColor: "#1dcbb6",
              overflow: "hidden",
              borderRadius: 150,
            }}
          >
            <Image
              source={{ uri: payloadData.bookingHome?.doctor?.image }}
              style={{
                height: 75,
                width: 55,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              gap: 1,
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{ fontFamily: "Nunito-R", fontSize: 15, width: "60%" }}
            >
              Dịch vụ khám sức khỏe tại nhà với bác sĩ{" "}
              {payloadData.bookingHome?.doctor.fullName}
            </Text>
            <Text style={{ fontFamily: "Nunito-B", fontSize: 15 }}>
              {payloadData.bookingHome?.doctor.fullName}
            </Text>
            <Text
              style={{
                fontFamily: "Nunito-S",
                fontSize: 13,
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: "#e0eff6",
                borderRadius: 5,
                marginVertical: 2,
              }}
            >
              {payloadData.bookingHome?.doctor.specialize}
            </Text>
            <Text style={{ fontFamily: "Nunito-S", fontSize: 15 }}>
              {formatMoney(payloadData.bookingHome?.price_list.price)} đ
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: "column",
          gap: 10,
          borderRadius: 5,
          width: "85%",
          borderWidth: 1,
          borderColor: "#cacfd2",
          marginTop: 15,
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontFamily: "Nunito-S", fontSize: 15 }}>
            Giá dịch vụ
          </Text>
          <Text style={{ fontFamily: "Nunito-S", fontSize: 14 }}>
            {formatMoney(payloadData.bookingHome?.price_list.price)} đ
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontFamily: "Nunito-S", fontSize: 15 }}>
            Tổng Thanh Toán
          </Text>
          <Text style={{ fontFamily: "Nunito-S", fontSize: 16, color: "red" }}>
            {formatMoney(payloadData.bookingHome?.price_list.price)} đ
          </Text>
        </View>
      </View>

      {/* <TouchableOpacity
        onPress={() => handleSubmit()}
        style={{
          borderRadius: 5,
          marginTop: 10,
          backgroundColor: "#1dcbb6",
          height: 45,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 15,
        }}
      >
        <Text style={{ color: "white", fontFamily: "Nunito-B" }}>
          Bước Tiếp Theo
        </Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default ChoosePayment;
