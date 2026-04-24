import traceback
import time
import requests

def test_propagation():
    print("--- 🧪 PHASE 2 VERIFICATION TESTER ---")
    try:
        print("\n1. Fetching Initial Data Space...")
        r1 = requests.get("http://127.0.0.1:8000/traffic_state").json()
        print("Initial Silk Board Vehicles:", r1["silk_board"]["vehicles"])
        init_madiwala = r1["madiwala"]["vehicles"]
        print("Initial Madiwala Vehicles:", init_madiwala)
        
        print("\n2. Triggering RL Green Light at Silk Board...")
        rl = requests.get("http://127.0.0.1:8000/intersection/mg_road/live?weather=clear").json()
        print("RL Instructed Green Delay:", rl["decision"]["green"], "seconds")
        
        print("\n3. Monitoring Graph Propagation Array...")
        arrival = False
        for i in range(12):
            time.sleep(1)
            current = requests.get("http://127.0.0.1:8000/traffic_state").json()
            m_vehicles = current["madiwala"]["vehicles"]
            if m_vehicles > init_madiwala:
                print(f" [t+{i+1}s] ✅ SHOCKWAVE DETECTED! Madiwala jumped to {m_vehicles} vehicles!")
                arrival = True
                break
            else:
                print(f" [t+{i+1}s] Madiwala Vehicles:", m_vehicles)
                
        if not arrival:
            print("\n❌ FAILED: Wave did not arrive.")
            
    except Exception as e:
        print("TEST SCRIPT ERROR:", traceback.format_exc())

if __name__ == "__main__":
    test_propagation()
