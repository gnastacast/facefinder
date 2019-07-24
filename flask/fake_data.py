import numpy as np
import json

with open('static/webgl-globe/globe/population909500_old.json') as f:
    data = json.load(f)

new_data = []

for i in range(5):
    if i == 0:
        new_data.append([str(i).zfill(3), data[2][1]])
        continue
    # if i == 1:
    #     numbers = np.array(data[2][1])
    #     numbers[1::3] = 0
    #     new_data.append([str(i).zfill(3), numbers.tolist()])
    #     continue
    new_data.append([str(i).zfill(3), []])
    new_data[i][0] = str(i).zfill(3)
    numbers = np.array(data[2][1])
    numbers[2::3] = numbers[2::3] * np.random.random(numbers[2::3].shape) * (i) / 5
    if i > 1:
    	numbers[2::3] = np.max(np.vstack([numbers[2::3], new_data[i-1][1][2::3]]), axis=0)
    numbers[2::3] = np.round(numbers[2::3], 3)
    numbers[0::3] = np.round(numbers[0::3])
    numbers[1::3] = np.round(numbers[1::3])
    new_data[i][1] = numbers.tolist()

with open('static/webgl-globe/globe/population909500.json', 'w') as f:
    json.dump(new_data, f)