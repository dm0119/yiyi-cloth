// 简化的省市区数据 - 只包含省级行政区
// 实际项目中可以使用完整的省市区数据或从服务器动态获取

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

// 部分城市的简化数据（示例）
export const cities = {
  '110000': [{ text: '北京市', value: '110100' }],
  '120000': [{ text: '天津市', value: '120100' }],
  '130000': [
    { text: '石家庄市', value: '130100' },
    { text: '唐山市', value: '130200' },
    { text: '秦皇岛市', value: '130300' },
    { text: '邯郸市', value: '130400' }
  ],
  '310000': [{ text: '上海市', value: '310100' }],
  '320000': [
    { text: '南京市', value: '320100' },
    { text: '无锡市', value: '320200' },
    { text: '徐州市', value: '320300' },
    { text: '苏州市', value: '320500' }
  ],
  '330000': [
    { text: '杭州市', value: '330100' },
    { text: '宁波市', value: '330200' },
    { text: '温州市', value: '330300' }
  ],
  '440000': [
    { text: '广州市', value: '440100' },
    { text: '深圳市', value: '440300' },
    { text: '珠海市', value: '440400' },
    { text: '汕头市', value: '440500' }
  ],
  '500000': [{ text: '重庆市', value: '500100' }]
}

// 部分区的简化数据（示例）
export const districts = {
  '110100': [
    { text: '东城区', value: '110101' },
    { text: '西城区', value: '110102' },
    { text: '朝阳区', value: '110105' },
    { text: '海淀区', value: '110108' }
  ],
  '120100': [
    { text: '和平区', value: '120101' },
    { text: '河东区', value: '120102' },
    { text: '河西区', value: '120103' }
  ],
  '310100': [
    { text: '黄浦区', value: '310101' },
    { text: '徐汇区', value: '310104' },
    { text: '长宁区', value: '310105' }
  ],
  '320100': [
    { text: '玄武区', value: '320102' },
    { text: '秦淮区', value: '320104' },
    { text: '建邺区', value: '320105' }
  ],
  '330100': [
    { text: '上城区', value: '330102' },
    { text: '下城区', value: '330103' },
    { text: '江干区', value: '330104' }
  ],
  '440100': [
    { text: '荔湾区', value: '440103' },
    { text: '越秀区', value: '440104' },
    { text: '海珠区', value: '440105' }
  ],
  '440300': [
    { text: '罗湖区', value: '440303' },
    { text: '福田区', value: '440304' },
    { text: '南山区', value: '440305' }
  ]
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
