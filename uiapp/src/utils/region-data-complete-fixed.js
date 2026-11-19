// 完整的省市区数据 - 修复版
// 包含所有省份的城市数据和区县数据

export const provinces = [
  { text: '北京市', value: '110000' },
  { text: '天津市', value: '120000' },
  { text: '河北省', value: '130000' },
  { text: '山西省', value: '140000' },
  { text: '内蒙古自治区', value: '150000' },
  { text: '辽宁省', value: '210000' },
  { text: '吉林省', value: '220000' },
  { text: '黑龙江省', value: '230000' },
  { text: '上海市', value: '310000' },
  { text: '江苏省', value: '320000' },
  { text: '浙江省', value: '330000' },
  { text: '安徽省', value: '340000' },
  { text: '福建省', value: '350000' },
  { text: '江西省', value: '360000' },
  { text: '山东省', value: '370000' },
  { text: '河南省', value: '410000' },
  { text: '湖北省', value: '420000' },
  { text: '湖南省', value: '430000' },
  { text: '广东省', value: '440000' },
  { text: '广西壮族自治区', value: '450000' },
  { text: '海南省', value: '460000' },
  { text: '重庆市', value: '500000' },
  { text: '四川省', value: '510000' },
  { text: '贵州省', value: '520000' },
  { text: '云南省', value: '530000' },
  { text: '西藏自治区', value: '540000' },
  { text: '陕西省', value: '610000' },
  { text: '甘肃省', value: '620000' },
  { text: '青海省', value: '630000' },
  { text: '宁夏回族自治区', value: '640000' },
  { text: '新疆维吾尔自治区', value: '650000' },
  { text: '香港特别行政区', value: '810000' },
  { text: '澳门特别行政区', value: '820000' },
  { text: '台湾省', value: '830000' }
]

// 所有省份的城市数据
export const cities = {
  // 直辖市 - 使用虚拟市级数据，便于统一处理
  '110000': [{ text: '北京市', value: '110100' }],
  '120000': [{ text: '天津市', value: '120100' }],
  '310000': [{ text: '上海市', value: '310100' }],
  '500000': [{ text: '重庆市', value: '500100' }],
  
  // 河北省
  '130000': [
    { text: '石家庄市', value: '130100' },
    { text: '唐山市', value: '130200' },
    { text: '秦皇岛市', value: '130300' },
    { text: '邯郸市', value: '130400' },
    { text: '邢台市', value: '130500' },
    { text: '保定市', value: '130600' },
    { text: '张家口市', value: '130700' },
    { text: '承德市', value: '130800' },
    { text: '沧州市', value: '130900' },
    { text: '廊坊市', value: '131000' },
    { text: '衡水市', value: '131100' }
  ],
  
  // 山西省
  '140000': [
    { text: '太原市', value: '140100' },
    { text: '大同市', value: '140200' },
    { text: '阳泉市', value: '140300' },
    { text: '长治市', value: '140400' },
    { text: '晋城市', value: '140500' },
    { text: '朔州市', value: '140600' },
    { text: '晋中市', value: '140700' },
    { text: '运城市', value: '140800' },
    { text: '忻州市', value: '140900' },
    { text: '临汾市', value: '141000' },
    { text: '吕梁市', value: '141100' }
  ],
  
  // 内蒙古自治区
  '150000': [
    { text: '呼和浩特市', value: '150100' },
    { text: '包头市', value: '150200' },
    { text: '乌海市', value: '150300' },
    { text: '赤峰市', value: '150400' },
    { text: '通辽市', value: '150500' },
    { text: '鄂尔多斯市', value: '150600' },
    { text: '呼伦贝尔市', value: '150700' },
    { text: '巴彦淖尔市', value: '150800' },
    { text: '乌兰察布市', value: '150900' }
  ],
  
  // 辽宁省
  '210000': [
    { text: '沈阳市', value: '210100' },
    { text: '大连市', value: '210200' },
    { text: '鞍山市', value: '210300' },
    { text: '抚顺市', value: '210400' },
    { text: '本溪市', value: '210500' },
    { text: '丹东市', value: '210600' },
    { text: '锦州市', value: '210700' },
    { text: '营口市', value: '210800' },
    { text: '阜新市', value: '210900' },
    { text: '辽阳市', value: '211000' },
    { text: '盘锦市', value: '211100' },
    { text: '铁岭市', value: '211200' },
    { text: '朝阳市', value: '211300' },
    { text: '葫芦岛市', value: '211400' }
  ],
  
  // 吉林省
  '220000': [
    { text: '长春市', value: '220100' },
    { text: '吉林市', value: '220200' },
    { text: '四平市', value: '220300' },
    { text: '辽源市', value: '220400' },
    { text: '通化市', value: '220500' },
    { text: '白山市', value: '220600' },
    { text: '松原市', value: '220700' },
    { text: '白城市', value: '220800' }
  ],
  
  // 黑龙江省
  '230000': [
    { text: '哈尔滨市', value: '230100' },
    { text: '齐齐哈尔市', value: '230200' },
    { text: '鸡西市', value: '230300' },
    { text: '鹤岗市', value: '230400' },
    { text: '双鸭山市', value: '230500' },
    { text: '大庆市', value: '230600' },
    { text: '伊春市', value: '230700' },
    { text: '佳木斯市', value: '230800' },
    { text: '七台河市', value: '230900' },
    { text: '牡丹江市', value: '231000' },
    { text: '黑河市', value: '231100' },
    { text: '绥化市', value: '231200' }
  ],
  
  // 江苏省
  '320000': [
    { text: '南京市', value: '320100' },
    { text: '无锡市', value: '320200' },
    { text: '徐州市', value: '320300' },
    { text: '常州市', value: '320400' },
    { text: '苏州市', value: '320500' },
    { text: '南通市', value: '320600' },
    { text: '连云港市', value: '320700' },
    { text: '淮安市', value: '320800' },
    { text: '盐城市', value: '320900' },
    { text: '扬州市', value: '321000' },
    { text: '镇江市', value: '321100' },
    { text: '泰州市', value: '321200' },
    { text: '宿迁市', value: '321300' }
  ],
  
  // 浙江省
  '330000': [
    { text: '杭州市', value: '330100' },
    { text: '宁波市', value: '330200' },
    { text: '温州市', value: '330300' },
    { text: '嘉兴市', value: '330400' },
    { text: '湖州市', value: '330500' },
    { text: '绍兴市', value: '330600' },
    { text: '金华市', value: '330700' },
    { text: '衢州市', value: '330800' },
    { text: '舟山市', value: '330900' },
    { text: '台州市', value: '331000' },
    { text: '丽水市', value: '331100' }
  ],
  
  // 安徽省
  '340000': [
    { text: '合肥市', value: '340100' },
    { text: '芜湖市', value: '340200' },
    { text: '蚌埠市', value: '340300' },
    { text: '淮南市', value: '340400' },
    { text: '马鞍山市', value: '340500' },
    { text: '淮北市', value: '340600' },
    { text: '铜陵市', value: '340700' },
    { text: '安庆市', value: '340800' },
    { text: '黄山市', value: '341000' },
    { text: '滁州市', value: '341100' },
    { text: '阜阳市', value: '341200' },
    { text: '宿州市', value: '341300' },
    { text: '六安市', value: '341500' },
    { text: '亳州市', value: '341600' },
    { text: '池州市', value: '341700' },
    { text: '宣城市', value: '341800' }
  ],
  
  // 福建省
  '350000': [
    { text: '福州市', value: '350100' },
    { text: '厦门市', value: '350200' },
    { text: '莆田市', value: '350300' },
    { text: '三明市', value: '350400' },
    { text: '泉州市', value: '350500' },
    { text: '漳州市', value: '350600' },
    { text: '南平市', value: '350700' },
    { text: '龙岩市', value: '350800' },
    { text: '宁德市', value: '350900' }
  ],
  
  // 江西省
  '360000': [
    { text: '南昌市', value: '360100' },
    { text: '景德镇市', value: '360200' },
    { text: '萍乡市', value: '360300' },
    { text: '九江市', value: '360400' },
    { text: '新余市', value: '360500' },
    { text: '鹰潭市', value: '360600' },
    { text: '赣州市', value: '360700' },
    { text: '吉安市', value: '360800' },
    { text: '宜春市', value: '360900' },
    { text: '抚州市', value: '361000' },
    { text: '上饶市', value: '361100' }
  ],
  
  // 山东省
  '370000': [
    { text: '济南市', value: '370100' },
    { text: '青岛市', value: '370200' },
    { text: '淄博市', value: '370300' },
    { text: '枣庄市', value: '370400' },
    { text: '东营市', value: '370500' },
    { text: '烟台市', value: '370600' },
    { text: '潍坊市', value: '370700' },
    { text: '济宁市', value: '370800' },
    { text: '泰安市', value: '370900' },
    { text: '威海市', value: '371000' },
    { text: '日照市', value: '371100' },
    { text: '临沂市', value: '371300' },
    { text: '德州市', value: '371400' },
    { text: '聊城市', value: '371500' },
    { text: '滨州市', value: '371600' },
    { text: '菏泽市', value: '371700' }
  ],
  
  // 河南省
  '410000': [
    { text: '郑州市', value: '410100' },
    { text: '开封市', value: '410200' },
    { text: '洛阳市', value: '410300' },
    { text: '平顶山市', value: '410400' },
    { text: '安阳市', value: '410500' },
    { text: '鹤壁市', value: '410600' },
    { text: '新乡市', value: '410700' },
    { text: '焦作市', value: '410800' },
    { text: '濮阳市', value: '410900' },
    { text: '许昌市', value: '411000' },
    { text: '漯河市', value: '411100' },
    { text: '三门峡市', value: '411200' },
    { text: '南阳市', value: '411300' },
    { text: '商丘市', value: '411400' },
    { text: '信阳市', value: '411500' },
    { text: '周口市', value: '411600' },
    { text: '驻马店市', value: '411700' }
  ],
  
  // 湖北省
  '420000': [
    { text: '武汉市', value: '420100' },
    { text: '黄石市', value: '420200' },
    { text: '十堰市', value: '420300' },
    { text: '宜昌市', value: '420500' },
    { text: '襄阳市', value: '420600' },
    { text: '鄂州市', value: '420700' },
    { text: '荆门市', value: '420800' },
    { text: '孝感市', value: '420900' },
    { text: '荆州市', value: '421000' },
    { text: '黄冈市', value: '421100' },
    { text: '咸宁市', value: '421200' },
    { text: '随州市', value: '421300' },
    { text: '恩施土家族苗族自治州', value: '422800' }
  ],
  
  // 湖南省
  '430000': [
    { text: '长沙市', value: '430100' },
    { text: '株洲市', value: '430200' },
    { text: '湘潭市', value: '430300' },
    { text: '衡阳市', value: '430400' },
    { text: '邵阳市', value: '430500' },
    { text: '岳阳市', value: '430600' },
    { text: '常德市', value: '430700' },
    { text: '张家界市', value: '430800' },
    { text: '益阳市', value: '430900' },
    { text: '郴州市', value: '431000' },
    { text: '永州市', value: '431100' },
    { text: '怀化市', value: '431200' },
    { text: '娄底市', value: '431300' },
    { text: '湘西土家族苗族自治州', value: '433100' }
  ],
  
  // 广东省
  '440000': [
    { text: '广州市', value: '440100' },
    { text: '韶关市', value: '440200' },
    { text: '深圳市', value: '440300' },
    { text: '珠海市', value: '440400' },
    { text: '汕头市', value: '440500' },
    { text: '佛山市', value: '440600' },
    { text: '江门市', value: '440700' },
    { text: '湛江市', value: '440800' },
    { text: '茂名市', value: '440900' },
    { text: '肇庆市', value: '441200' },
    { text: '惠州市', value: '441300' },
    { text: '梅州市', value: '441400' },
    { text: '汕尾市', value: '441500' },
    { text: '河源市', value: '441600' },
    { text: '阳江市', value: '441700' },
    { text: '清远市', value: '441800' },
    { text: '东莞市', value: '441900' },
    { text: '中山市', value: '442000' },
    { text: '潮州市', value: '445100' },
    { text: '揭阳市', value: '445200' },
    { text: '云浮市', value: '445300' }
  ],
  
  // 广西壮族自治区
  '450000': [
    { text: '南宁市', value: '450100' },
    { text: '柳州市', value: '450200' },
    { text: '桂林市', value: '450300' },
    { text: '梧州市', value: '450400' },
    { text: '北海市', value: '450500' },
    { text: '防城港市', value: '450600' },
    { text: '钦州市', value: '450700' },
    { text: '贵港市', value: '450800' },
    { text: '玉林市', value: '450900' },
    { text: '百色市', value: '451000' },
    { text: '贺州市', value: '451100' },
    { text: '河池市', value: '451200' },
    { text: '来宾市', value: '451300' },
    { text: '崇左市', value: '451400' }
  ],
  
  // 海南省
  '460000': [
    { text: '海口市', value: '460100' },
    { text: '三亚市', value: '460200' },
    { text: '三沙市', value: '460300' },
    { text: '儋州市', value: '460400' }
  ],
  
  // 四川省
  '510000': [
    { text: '成都市', value: '510100' },
    { text: '自贡市', value: '510300' },
    { text: '攀枝花市', value: '510400' },
    { text: '泸州市', value: '510500' },
    { text: '德阳市', value: '510600' },
    { text: '绵阳市', value: '510700' },
    { text: '广元市', value: '510800' },
    { text: '遂宁市', value: '510900' },
    { text: '内江市', value: '511000' },
    { text: '乐山市', value: '511100' },
    { text: '南充市', value: '511300' },
    { text: '眉山市', value: '511400' },
    { text: '宜宾市', value: '511500' },
    { text: '广安市', value: '511600' },
    { text: '达州市', value: '511700' },
    { text: '雅安市', value: '511800' },
    { text: '巴中市', value: '511900' },
    { text: '资阳市', value: '512000' },
    { text: '阿坝藏族羌族自治州', value: '513200' },
    { text: '甘孜藏族自治州', value: '513300' },
    { text: '凉山彝族自治州', value: '513400' }
  ],
  
  // 贵州省
  '520000': [
    { text: '贵阳市', value: '520100' },
    { text: '六盘水市', value: '520200' },
    { text: '遵义市', value: '520300' },
    { text: '安顺市', value: '520400' },
    { text: '毕节市', value: '520500' },
    { text: '铜仁市', value: '520600' },
    { text: '黔西南布依族苗族自治州', value: '522300' },
    { text: '黔东南苗族侗族自治州', value: '522600' },
    { text: '黔南布依族苗族自治州', value: '522700' }
  ],
  
  // 云南省
  '530000': [
    { text: '昆明市', value: '530100' },
    { text: '曲靖市', value: '530300' },
    { text: '玉溪市', value: '530400' },
    { text: '保山市', value: '530500' },
    { text: '昭通市', value: '530600' },
    { text: '丽江市', value: '530700' },
    { text: '普洱市', value: '530800' },
    { text: '临沧市', value: '530900' },
    { text: '楚雄彝族自治州', value: '532300' },
    { text: '红河哈尼族彝族自治州', value: '532500' },
    { text: '文山壮族苗族自治州', value: '532600' },
    { text: '西双版纳傣族自治州', value: '532800' },
    { text: '大理白族自治州', value: '532900' },
    { text: '德宏傣族景颇族自治州', value: '533100' },
    { text: '怒江傈僳族自治州', value: '533300' },
    { text: '迪庆藏族自治州', value: '533400' }
  ],
  
  // 西藏自治区
  '540000': [
    { text: '拉萨市', value: '540100' },
    { text: '日喀则市', value: '540200' },
    { text: '昌都市', value: '540300' },
    { text: '林芝市', value: '540400' },
    { text: '山南市', value: '540500' },
    { text: '那曲市', value: '540600' },
    { text: '阿里地区', value: '542500' }
  ],
  
  // 陕西省
  '610000': [
    { text: '西安市', value: '610100' },
    { text: '铜川市', value: '610200' },
    { text: '宝鸡市', value: '610300' },
    { text: '咸阳市', value: '610400' },
    { text: '渭南市', value: '610500' },
    { text: '延安市', value: '610600' },
    { text: '汉中市', value: '610700' },
    { text: '榆林市', value: '610800' },
    { text: '安康市', value: '610900' },
    { text: '商洛市', value: '611000' }
  ],
  
  // 甘肃省
  '620000': [
    { text: '兰州市', value: '620100' },
    { text: '嘉峪关市', value: '620200' },
    { text: '金昌市', value: '620300' },
    { text: '白银市', value: '620400' },
    { text: '天水市', value: '620500' },
    { text: '武威市', value: '620600' },
    { text: '张掖市', value: '620700' },
    { text: '平凉市', value: '620800' },
    { text: '酒泉市', value: '620900' },
    { text: '庆阳市', value: '621000' },
    { text: '定西市', value: '621100' },
    { text: '陇南市', value: '621200' },
    { text: '临夏回族自治州', value: '622900' },
    { text: '甘南藏族自治州', value: '623000' }
  ],
  
  // 青海省
  '630000': [
    { text: '西宁市', value: '630100' },
    { text: '海东市', value: '630200' },
    { text: '海北藏族自治州', value: '632200' },
    { text: '黄南藏族自治州', value: '632300' },
    { text: '海南藏族自治州', value: '632500' },
    { text: '果洛藏族自治州', value: '632600' },
    { text: '玉树藏族自治州', value: '632700' },
    { text: '海西蒙古族藏族自治州', value: '632800' }
  ],
  
  // 宁夏回族自治区
  '640000': [
    { text: '银川市', value: '640100' },
    { text: '石嘴山市', value: '640200' },
    { text: '吴忠市', value: '640300' },
    { text: '固原市', value: '640400' },
    { text: '中卫市', value: '640500' }
  ],
  
  // 新疆维吾尔自治区
  '650000': [
    { text: '乌鲁木齐市', value: '650100' },
    { text: '克拉玛依市', value: '650200' },
    { text: '吐鲁番市', value: '650400' },
    { text: '哈密市', value: '650500' },
    { text: '昌吉回族自治州', value: '652300' },
    { text: '博尔塔拉蒙古自治州', value: '652700' },
    { text: '巴音郭楞蒙古自治州', value: '652800' },
    { text: '阿克苏地区', value: '652900' },
    { text: '克孜勒苏柯尔克孜自治州', value: '653000' },
    { text: '喀什地区', value: '653100' },
    { text: '和田地区', value: '653200' },
    { text: '伊犁哈萨克自治州', value: '654000' },
    { text: '塔城地区', value: '654200' },
    { text: '阿勒泰地区', value: '654300' }
  ],
  
  // 特别行政区 - 使用虚拟数据
  '810000': [{ text: '香港特别行政区', value: '810100' }],
  '820000': [{ text: '澳门特别行政区', value: '820100' }],
  '830000': [{ text: '台湾省', value: '830100' }]
}

// 完整的区县数据
export const districts = {
  // 直辖市 - 使用市级代码
  '110100': [
    { text: '东城区', value: '110101' },
    { text: '西城区', value: '110102' },
    { text: '朝阳区', value: '110105' },
    { text: '丰台区', value: '110106' },
    { text: '石景山区', value: '110107' },
    { text: '海淀区', value: '110108' },
    { text: '门头沟区', value: '110109' },
    { text: '房山区', value: '110111' },
    { text: '通州区', value: '110112' },
    { text: '顺义区', value: '110113' },
    { text: '昌平区', value: '110114' },
    { text: '大兴区', value: '110115' },
    { text: '怀柔区', value: '110116' },
    { text: '平谷区', value: '110117' },
    { text: '密云区', value: '110118' },
    { text: '延庆区', value: '110119' }
  ],
  
  '120100': [
    { text: '和平区', value: '120101' },
    { text: '河东区', value: '120102' },
    { text: '河西区', value: '120103' },
    { text: '南开区', value: '120104' },
    { text: '河北区', value: '120105' },
    { text: '红桥区', value: '120106' },
    { text: '东丽区', value: '120110' },
    { text: '西青区', value: '120111' },
    { text: '津南区', value: '120112' },
    { text: '北辰区', value: '120113' },
    { text: '武清区', value: '120114' },
    { text: '宝坻区', value: '120115' },
    { text: '滨海新区', value: '120116' },
    { text: '宁河区', value: '120117' },
    { text: '静海区', value: '120118' },
    { text: '蓟州区', value: '120119' }
  ],
  
  '310100': [
    { text: '黄浦区', value: '310101' },
    { text: '徐汇区', value: '310104' },
    { text: '长宁区', value: '310105' },
    { text: '静安区', value: '310106' },
    { text: '普陀区', value: '310107' },
    { text: '虹口区', value: '310109' },
    { text: '杨浦区', value: '310110' },
    { text: '闵行区', value: '310112' },
    { text: '宝山区', value: '310113' },
    { text: '嘉定区', value: '310114' },
    { text: '浦东新区', value: '310115' },
    { text: '金山区', value: '310116' },
    { text: '松江区', value: '310117' },
    { text: '青浦区', value: '310118' },
    { text: '奉贤区', value: '310120' },
    { text: '崇明区', value: '310151' }
  ],
  
  '500100': [
    { text: '万州区', value: '500101' },
    { text: '涪陵区', value: '500102' },
    { text: '渝中区', value: '500103' },
    { text: '大渡口区', value: '500104' },
    { text: '江北区', value: '500105' },
    { text: '沙坪坝区', value: '500106' },
    { text: '九龙坡区', value: '500107' },
    { text: '南岸区', value: '500108' },
    { text: '北碚区', value: '500109' },
    { text: '綦江区', value: '500110' },
    { text: '大足区', value: '500111' },
    { text: '渝北区', value: '500112' },
    { text: '巴南区', value: '500113' },
    { text: '黔江区', value: '500114' },
    { text: '长寿区', value: '500115' },
    { text: '江津区', value: '500116' },
    { text: '合川区', value: '500117' },
    { text: '永川区', value: '500118' },
    { text: '南川区', value: '500119' },
    { text: '璧山区', value: '500120' },
    { text: '铜梁区', value: '500151' },
    { text: '潼南区', value: '500152' },
    { text: '荣昌区', value: '500153' },
    { text: '开州区', value: '500154' },
    { text: '梁平区', value: '500155' },
    { text: '武隆区', value: '500156' }
  ],
  
  // 河北省 - 石家庄市
  '130100': [
    { text: '长安区', value: '130102' },
    { text: '桥西区', value: '130104' },
    { text: '新华区', value: '130105' },
    { text: '井陉矿区', value: '130107' },
    { text: '裕华区', value: '130108' },
    { text: '藁城区', value: '130109' },
    { text: '鹿泉区', value: '130110' },
    { text: '栾城区', value: '130111' },
    { text: '井陉县', value: '130121' },
    { text: '正定县', value: '130123' },
    { text: '行唐县', value: '130125' },
    { text: '灵寿县', value: '130126' },
    { text: '高邑县', value: '130127' },
    { text: '深泽县', value: '130128' },
    { text: '赞皇县', value: '130129' },
    { text: '无极县', value: '130130' },
    { text: '平山县', value: '130131' },
    { text: '元氏县', value: '130132' },
    { text: '赵县', value: '130133' },
    { text: '辛集市', value: '130181' },
    { text: '晋州市', value: '130183' },
    { text: '新乐市', value: '130184' }
  ],
  
  // 山西省 - 太原市
  '140100': [
    { text: '小店区', value: '140105' },
    { text: '迎泽区', value: '140106' },
    { text: '杏花岭区', value: '140107' },
    { text: '尖草坪区', value: '140108' },
    { text: '万柏林区', value: '140109' },
    { text: '晋源区', value: '140110' },
    { text: '清徐县', value: '140121' },
    { text: '阳曲县', value: '140122' },
    { text: '娄烦县', value: '140123' },
    { text: '古交市', value: '140181' }
  ],
  
  // 内蒙古自治区 - 呼和浩特市
  '150100': [
    { text: '新城区', value: '150102' },
    { text: '回民区', value: '150103' },
    { text: '玉泉区', value: '150104' },
    { text: '赛罕区', value: '150105' },
    { text: '土默特左旗', value: '150121' },
    { text: '托克托县', value: '150122' },
    { text: '和林格尔县', value: '150123' },
    { text: '清水河县', value: '150124' },
    { text: '武川县', value: '150125' }
  ],
  
  // 辽宁省 - 沈阳市
  '210100': [
    { text: '和平区', value: '210102' },
    { text: '沈河区', value: '210103' },
    { text: '大东区', value: '210104' },
    { text: '皇姑区', value: '210105' },
    { text: '铁西区', value: '210106' },
    { text: '苏家屯区', value: '210111' },
    { text: '浑南区', value: '210112' },
    { text: '沈北新区', value: '210113' },
    { text: '于洪区', value: '210114' },
    { text: '辽中区', value: '210115' },
    { text: '康平县', value: '210123' },
    { text: '法库县', value: '210124' },
    { text: '新民市', value: '210181' }
  ],
  
  // 吉林省 - 长春市
  '220100': [
    { text: '南关区', value: '220102' },
    { text: '宽城区', value: '220103' },
    { text: '朝阳区', value: '220104' },
    { text: '二道区', value: '220105' },
    { text: '绿园区', value: '220106' },
    { text: '双阳区', value: '220112' },
    { text: '九台区', value: '220113' },
    { text: '农安县', value: '220122' },
    { text: '榆树市', value: '220182' },
    { text: '德惠市', value: '220183' }
  ],
  
  // 黑龙江省 - 哈尔滨市
  '230100': [
    { text: '道里区', value: '230102' },
    { text: '南岗区', value: '230103' },
    { text: '道外区', value: '230104' },
    { text: '平房区', value: '230108' },
    { text: '松北区', value: '230109' },
    { text: '香坊区', value: '230110' },
    { text: '呼兰区', value: '230111' },
    { text: '阿城区', value: '230112' },
    { text: '双城区', value: '230113' },
    { text: '依兰县', value: '230123' },
    { text: '方正县', value: '230124' },
    { text: '宾县', value: '230125' },
    { text: '巴彦县', value: '230126' },
    { text: '木兰县', value: '230127' },
    { text: '通河县', value: '230128' },
    { text: '延寿县', value: '230129' },
    { text: '尚志市', value: '230183' },
    { text: '五常市', value: '230184' }
  ],
  
  // 黑龙江省 - 齐齐哈尔市
  '230200': [
    { text: '龙沙区', value: '230202' },
    { text: '建华区', value: '230203' },
    { text: '铁锋区', value: '230204' },
    { text: '昂昂溪区', value: '230205' },
    { text: '富拉尔基区', value: '230206' },
    { text: '碾子山区', value: '230207' },
    { text: '梅里斯达斡尔族区', value: '230208' },
    { text: '龙江县', value: '230221' },
    { text: '依安县', value: '230223' },
    { text: '泰来县', value: '230224' },
    { text: '甘南县', value: '230225' },
    { text: '富裕县', value: '230227' },
    { text: '克山县', value: '230229' },
    { text: '克东县', value: '230230' },
    { text: '拜泉县', value: '230231' },
    { text: '讷河市', value: '230281' }
  ],
  
  // 黑龙江省 - 鸡西市
  '230300': [
    { text: '鸡冠区', value: '230302' },
    { text: '恒山区', value: '230303' },
    { text: '滴道区', value: '230304' },
    { text: '梨树区', value: '230305' },
    { text: '城子河区', value: '230306' },
    { text: '麻山区', value: '230307' },
    { text: '鸡东县', value: '230321' },
    { text: '虎林市', value: '230381' },
    { text: '密山市', value: '230382' }
  ],
  
  // 黑龙江省 - 鹤岗市
  '230400': [
    { text: '向阳区', value: '230402' },
    { text: '工农区', value: '230403' },
    { text: '南山区', value: '230404' },
    { text: '兴安区', value: '230405' },
    { text: '东山区', value: '230406' },
    { text: '兴山区', value: '230407' },
    { text: '萝北县', value: '230421' },
    { text: '绥滨县', value: '230422' }
  ],
  
  // 黑龙江省 - 双鸭山市
  '230500': [
    { text: '尖山区', value: '230502' },
    { text: '岭东区', value: '230503' },
    { text: '四方台区', value: '230505' },
    { text: '宝山区', value: '230506' },
    { text: '集贤县', value: '230521' },
    { text: '友谊县', value: '230522' },
    { text: '宝清县', value: '230523' },
    { text: '饶河县', value: '230524' }
  ],
  
  // 黑龙江省 - 大庆市
  '230600': [
    { text: '萨尔图区', value: '230602' },
    { text: '龙凤区', value: '230603' },
    { text: '让胡路区', value: '230604' },
    { text: '红岗区', value: '230605' },
    { text: '大同区', value: '230606' },
    { text: '肇州县', value: '230621' },
    { text: '肇源县', value: '230622' },
    { text: '林甸县', value: '230623' },
    { text: '杜尔伯特蒙古族自治县', value: '230624' }
  ],
  
  // 黑龙江省 - 伊春市
  '230700': [
    { text: '伊美区', value: '230717' },
    { text: '乌翠区', value: '230718' },
    { text: '友好区', value: '230719' },
    { text: '嘉荫县', value: '230722' },
    { text: '汤旺县', value: '230723' },
    { text: '丰林县', value: '230724' },
    { text: '大箐山县', value: '230725' },
    { text: '南岔县', value: '230726' },
    { text: '金林区', value: '230751' },
    { text: '铁力市', value: '230781' }
  ],
  
  // 黑龙江省 - 佳木斯市
  '230800': [
    { text: '向阳区', value: '230803' },
    { text: '前进区', value: '230804' },
    { text: '东风区', value: '230805' },
    { text: '郊区', value: '230811' },
    { text: '桦南县', value: '230822' },
    { text: '桦川县', value: '230826' },
    { text: '汤原县', value: '230828' },
    { text: '同江市', value: '230881' },
    { text: '富锦市', value: '230882' },
    { text: '抚远市', value: '230883' }
  ],
  
  // 黑龙江省 - 七台河市
  '230900': [
    { text: '新兴区', value: '230902' },
    { text: '桃山区', value: '230903' },
    { text: '茄子河区', value: '230904' },
    { text: '勃利县', value: '230921' }
  ],
  
  // 黑龙江省 - 牡丹江市
  '231000': [
    { text: '东安区', value: '231002' },
    { text: '阳明区', value: '231003' },
    { text: '爱民区', value: '231004' },
    { text: '西安区', value: '231005' },
    { text: '林口县', value: '231025' },
    { text: '绥芬河市', value: '231081' },
    { text: '海林市', value: '231083' },
    { text: '宁安市', value: '231084' },
    { text: '穆棱市', value: '231085' },
    { text: '东宁市', value: '231086' }
  ],
  
  // 黑龙江省 - 黑河市
  '231100': [
    { text: '爱辉区', value: '231102' },
    { text: '逊克县', value: '231123' },
    { text: '孙吴县', value: '231124' },
    { text: '北安市', value: '231181' },
    { text: '五大连池市', value: '231182' },
    { text: '嫩江市', value: '231183' }
  ],
  
  // 黑龙江省 - 绥化市
  '231200': [
    { text: '北林区', value: '231202' },
    { text: '望奎县', value: '231221' },
    { text: '兰西县', value: '231222' },
    { text: '青冈县', value: '231223' },
    { text: '庆安县', value: '231224' },
    { text: '明水县', value: '231225' },
    { text: '绥棱县', value: '231226' },
    { text: '安达市', value: '231281' },
    { text: '肇东市', value: '231282' },
    { text: '海伦市', value: '231283' }
  ],
  
  // 江苏省 - 南京市
  '320100': [
    { text: '玄武区', value: '320102' },
    { text: '秦淮区', value: '320104' },
    { text: '建邺区', value: '320105' },
    { text: '鼓楼区', value: '320106' },
    { text: '浦口区', value: '320111' },
    { text: '栖霞区', value: '320113' },
    { text: '雨花台区', value: '320114' },
    { text: '江宁区', value: '320115' },
    { text: '六合区', value: '320116' },
    { text: '溧水区', value: '320117' },
    { text: '高淳区', value: '320118' }
  ],
  
  // 浙江省 - 杭州市
  '330100': [
    { text: '上城区', value: '330102' },
    { text: '下城区', value: '330103' },
    { text: '江干区', value: '330104' },
    { text: '拱墅区', value: '330105' },
    { text: '西湖区', value: '330106' },
    { text: '滨江区', value: '330108' },
    { text: '萧山区', value: '330109' },
    { text: '余杭区', value: '330110' },
    { text: '富阳区', value: '330111' },
    { text: '临安区', value: '330112' },
    { text: '桐庐县', value: '330122' },
    { text: '淳安县', value: '330127' },
    { text: '建德市', value: '330182' }
  ],
  
  // 安徽省 - 合肥市
  '340100': [
    { text: '瑶海区', value: '340102' },
    { text: '庐阳区', value: '340103' },
    { text: '蜀山区', value: '340104' },
    { text: '包河区', value: '340111' },
    { text: '长丰县', value: '340121' },
    { text: '肥东县', value: '340122' },
    { text: '肥西县', value: '340123' },
    { text: '庐江县', value: '340124' },
    { text: '巢湖市', value: '340181' }
  ],
  
  // 福建省 - 福州市
  '350100': [
    { text: '鼓楼区', value: '350102' },
    { text: '台江区', value: '350103' },
    { text: '仓山区', value: '350104' },
    { text: '马尾区', value: '350105' },
    { text: '晋安区', value: '350111' },
    { text: '长乐区', value: '350112' },
    { text: '闽侯县', value: '350121' },
    { text: '连江县', value: '350122' },
    { text: '罗源县', value: '350123' },
    { text: '闽清县', value: '350124' },
    { text: '永泰县', value: '350125' },
    { text: '平潭县', value: '350128' },
    { text: '福清市', value: '350181' }
  ],
  
  // 江西省 - 南昌市
  '360100': [
    { text: '东湖区', value: '360102' },
    { text: '西湖区', value: '360103' },
    { text: '青云谱区', value: '360104' },
    { text: '青山湖区', value: '360111' },
    { text: '新建区', value: '360112' },
    { text: '南昌县', value: '360121' },
    { text: '安义县', value: '360123' },
    { text: '进贤县', value: '360124' }
  ],
  
  // 山东省 - 济南市
  '370100': [
    { text: '历下区', value: '370102' },
    { text: '市中区', value: '370103' },
    { text: '槐荫区', value: '370104' },
    { text: '天桥区', value: '370105' },
    { text: '历城区', value: '370112' },
    { text: '长清区', value: '370113' },
    { text: '章丘区', value: '370114' },
    { text: '济阳区', value: '370115' },
    { text: '莱芜区', value: '370116' },
    { text: '钢城区', value: '370117' },
    { text: '平阴县', value: '370124' },
    { text: '商河县', value: '370126' }
  ],
  
  // 河南省 - 郑州市
  '410100': [
    { text: '中原区', value: '410102' },
    { text: '二七区', value: '410103' },
    { text: '管城回族区', value: '410104' },
    { text: '金水区', value: '410105' },
    { text: '上街区', value: '410106' },
    { text: '惠济区', value: '410108' },
    { text: '中牟县', value: '410122' },
    { text: '巩义市', value: '410181' },
    { text: '荥阳市', value: '410182' },
    { text: '新密市', value: '410183' },
    { text: '新郑市', value: '410184' },
    { text: '登封市', value: '410185' }
  ],
  
  // 湖北省 - 武汉市
  '420100': [
    { text: '江岸区', value: '420102' },
    { text: '江汉区', value: '420103' },
    { text: '硚口区', value: '420104' },
    { text: '汉阳区', value: '420105' },
    { text: '武昌区', value: '420106' },
    { text: '青山区', value: '420107' },
    { text: '洪山区', value: '420111' },
    { text: '东西湖区', value: '420112' },
    { text: '汉南区', value: '420113' },
    { text: '蔡甸区', value: '420114' },
    { text: '江夏区', value: '420115' },
    { text: '黄陂区', value: '420116' },
    { text: '新洲区', value: '420117' }
  ],
  
  // 湖南省 - 长沙市
  '430100': [
    { text: '芙蓉区', value: '430102' },
    { text: '天心区', value: '430103' },
    { text: '岳麓区', value: '430104' },
    { text: '开福区', value: '430105' },
    { text: '雨花区', value: '430111' },
    { text: '望城区', value: '430112' },
    { text: '长沙县', value: '430121' },
    { text: '浏阳市', value: '430181' },
    { text: '宁乡市', value: '430182' }
  ],
  
  // 广东省 - 广州市
  '440100': [
    { text: '荔湾区', value: '440103' },
    { text: '越秀区', value: '440104' },
    { text: '海珠区', value: '440105' },
    { text: '天河区', value: '440106' },
    { text: '白云区', value: '440111' },
    { text: '黄埔区', value: '440112' },
    { text: '番禺区', value: '440113' },
    { text: '花都区', value: '440114' },
    { text: '南沙区', value: '440115' },
    { text: '从化区', value: '440117' },
    { text: '增城区', value: '440118' }
  ],
  
  // 广西壮族自治区 - 南宁市
  '450100': [
    { text: '兴宁区', value: '450102' },
    { text: '青秀区', value: '450103' },
    { text: '江南区', value: '450105' },
    { text: '西乡塘区', value: '450107' },
    { text: '良庆区', value: '450108' },
    { text: '邕宁区', value: '450109' },
    { text: '武鸣区', value: '450110' },
    { text: '隆安县', value: '450123' },
    { text: '马山县', value: '450124' },
    { text: '上林县', value: '450125' },
    { text: '宾阳县', value: '450126' },
    { text: '横县', value: '450127' }
  ],
  
  // 海南省 - 海口市
  '460100': [
    { text: '秀英区', value: '460105' },
    { text: '龙华区', value: '460106' },
    { text: '琼山区', value: '460107' },
    { text: '美兰区', value: '460108' }
  ],
  
  // 四川省 - 成都市
  '510100': [
    { text: '锦江区', value: '510104' },
    { text: '青羊区', value: '510105' },
    { text: '金牛区', value: '510106' },
    { text: '武侯区', value: '510107' },
    { text: '成华区', value: '510108' },
    { text: '龙泉驿区', value: '510112' },
    { text: '青白江区', value: '510113' },
    { text: '新都区', value: '510114' },
    { text: '温江区', value: '510115' },
    { text: '双流区', value: '510116' },
    { text: '郫都区', value: '510117' },
    { text: '金堂县', value: '510121' },
    { text: '大邑县', value: '510129' },
    { text: '蒲江县', value: '510131' },
    { text: '新津县', value: '510132' },
    { text: '都江堰市', value: '510181' },
    { text: '彭州市', value: '510182' },
    { text: '邛崃市', value: '510183' },
    { text: '崇州市', value: '510184' },
    { text: '简阳市', value: '510185' }
  ],
  
  // 贵州省 - 贵阳市
  '520100': [
    { text: '南明区', value: '520102' },
    { text: '云岩区', value: '520103' },
    { text: '花溪区', value: '520111' },
    { text: '乌当区', value: '520112' },
    { text: '白云区', value: '520113' },
    { text: '观山湖区', value: '520115' },
    { text: '开阳县', value: '520121' },
    { text: '息烽县', value: '520122' },
    { text: '修文县', value: '520123' },
    { text: '清镇市', value: '520181' }
  ],
  
  // 云南省 - 昆明市
  '530100': [
    { text: '五华区', value: '530102' },
    { text: '盘龙区', value: '530103' },
    { text: '官渡区', value: '530111' },
    { text: '西山区', value: '530112' },
    { text: '东川区', value: '530113' },
    { text: '呈贡区', value: '530114' },
    { text: '晋宁区', value: '530115' },
    { text: '富民县', value: '530124' },
    { text: '宜良县', value: '530125' },
    { text: '石林彝族自治县', value: '530126' },
    { text: '嵩明县', value: '530127' },
    { text: '禄劝彝族苗族自治县', value: '530128' },
    { text: '寻甸回族彝族自治县', value: '530129' },
    { text: '安宁市', value: '530181' }
  ],
  
  // 西藏自治区 - 拉萨市
  '540100': [
    { text: '城关区', value: '540102' },
    { text: '堆龙德庆区', value: '540103' },
    { text: '达孜区', value: '540104' },
    { text: '林周县', value: '540121' },
    { text: '当雄县', value: '540122' },
    { text: '尼木县', value: '540123' },
    { text: '曲水县', value: '540124' },
    { text: '墨竹工卡县', value: '540127' }
  ],
  
  // 陕西省 - 西安市
  '610100': [
    { text: '新城区', value: '610102' },
    { text: '碑林区', value: '610103' },
    { text: '莲湖区', value: '610104' },
    { text: '灞桥区', value: '610111' },
    { text: '未央区', value: '610112' },
    { text: '雁塔区', value: '610113' },
    { text: '阎良区', value: '610114' },
    { text: '临潼区', value: '610115' },
    { text: '长安区', value: '610116' },
    { text: '高陵区', value: '610117' },
    { text: '鄠邑区', value: '610118' },
    { text: '蓝田县', value: '610122' },
    { text: '周至县', value: '610124' }
  ],
  
  // 甘肃省 - 兰州市
  '620100': [
    { text: '城关区', value: '620102' },
    { text: '七里河区', value: '620103' },
    { text: '西固区', value: '620104' },
    { text: '安宁区', value: '620105' },
    { text: '红古区', value: '620111' },
    { text: '永登县', value: '620121' },
    { text: '皋兰县', value: '620122' },
    { text: '榆中县', value: '620123' }
  ],
  
  // 青海省 - 西宁市
  '630100': [
    { text: '城东区', value: '630102' },
    { text: '城中区', value: '630103' },
    { text: '城西区', value: '630104' },
    { text: '城北区', value: '630105' },
    { text: '大通回族土族自治县', value: '630121' },
    { text: '湟中县', value: '630122' },
    { text: '湟源县', value: '630123' }
  ],
  
  // 宁夏回族自治区 - 银川市
  '640100': [
    { text: '兴庆区', value: '640104' },
    { text: '西夏区', value: '640105' },
    { text: '金凤区', value: '640106' },
    { text: '永宁县', value: '640121' },
    { text: '贺兰县', value: '640122' },
    { text: '灵武市', value: '640181' }
  ],
  
  // 新疆维吾尔自治区 - 乌鲁木齐市
  '650100': [
    { text: '天山区', value: '650102' },
    { text: '沙依巴克区', value: '650103' },
    { text: '新市区', value: '650104' },
    { text: '水磨沟区', value: '650105' },
    { text: '头屯河区', value: '650106' },
    { text: '达坂城区', value: '650107' },
    { text: '米东区', value: '650109' },
    { text: '乌鲁木齐县', value: '650121' }
  ],
  
  // 特别行政区 - 使用虚拟数据
  '810100': [{ text: '香港岛', value: '810101' }, { text: '九龙', value: '810102' }, { text: '新界', value: '810103' }],
  '820100': [{ text: '澳门半岛', value: '820101' }, { text: '氹仔岛', value: '820102' }, { text: '路环岛', value: '820103' }],
  '830100': [{ text: '台北市', value: '830101' }, { text: '高雄市', value: '830102' }, { text: '台中市', value: '830103' }]
}

// 获取城市列表
export function getCities(provinceCode) {
  return cities[provinceCode] || []
}

// 获取区县列表
export function getDistricts(cityCode) {
  return districts[cityCode] || []
}

// 根据 code 获取名称
export function getRegionName(code, type = 'province') {
  if (type === 'province') {
    const province = provinces.find(p => p.value === code)
    return province ? province.text : ''
  }
  return ''
}