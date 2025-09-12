# 导入所需库
import numpy as np
import matplotlib.pyplot as plt

# 1. 生成x轴数据：在0到2π之间生成1000个均匀分布的点（点越多曲线越平滑）
x = np.linspace(0, 2 * np.pi, 1000)

# 2. 计算对应的sinx值
y = np.sin(x)

# 3. 创建画布并绘图
plt.figure(figsize=(8, 4))  # 设置画布大小（宽8英寸，高4英寸）
plt.plot(x, y, color='blue', linewidth=2, label='y = sin(x)')  # 绘制sinx曲线

# 4. 添加图表细节（让图表更清晰）
plt.xlabel('x (弧度)', fontsize=12)  # x轴标签
plt.ylabel('y = sin(x)', fontsize=12)  # y轴标签
plt.title('正弦函数 y = sin(x) 图像', fontsize=14, pad=15)  # 图表标题
plt.legend(fontsize=10)  # 显示图例（对应曲线标签）
plt.grid(True, alpha=0.3)  # 添加网格（alpha控制透明度，避免遮挡曲线）

# 5. 显示图像
plt.show()
