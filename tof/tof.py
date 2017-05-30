import environment
import random

if not environment.is_mac():
  import VL53L0X_rasp_python.python.VL53L0X as VL53L0X

class Tof(object):

  def __init__(self):
    if not environment.is_mac():
      self.tof = VL53L0X.VL53L0X()
      self.tof.start_ranging(VL53L0X.VL53L0X_BETTER_ACCURACY_MODE)

  def get_timing(self):
    if not environment.is_mac():
      timing = self.tof.get_timing()
      if (timing < 20000):
        timing = 20000
      return timing
    else:
      return 0

  def get_distance(self):
    if not environment.is_mac():
      return self.tof.get_distance()
    else:
      return random.randint(300, 800)
