#include <iostream>
#include <memory>
#include <unordered_map>
#include <cstdint>



// // Define a class to manage the dynamic structure and the map
// class SigmaStructure {
// private:
//     void** sigma; // Dynamic structure
//     std::unordered_map<uint64_t, size_t> indexMap; // Map to store UID-index pairs
//     size_t size; // Current size of the structure
//     size_t capacity; // Capacity of the structure

// public:
//     SigmaStructure(size_t initialCapacity = 10) : size(0), capacity(initialCapacity) {
//         sigma = new void*[capacity];
//     }

//     ~SigmaStructure() {
//         delete[] sigma;
//     }

//     // Function to add a dynamically created object
//     void addObject(void* obj) {
//         if (size >= capacity) {
//             // Resize the sigma structure if needed
//             capacity *= 2;
//             void** temp = new void*[capacity];
//             std::copy(sigma, sigma + size, temp);
//             delete[] sigma;
//             sigma = temp;
//         }

//         // Add the object to sigma
//         int uid = (uint64_t)obj; //the adress of the object
//         sigma[size] = obj; // releasing ownership
//         // Store the UID-index mapping
//         indexMap[uid] = size;
//         ++size;
//     }

//     // Function to remove object by UID
//     void removeObject(uint64_t uid) {
//         auto it = indexMap.find(uid);
//         if (it != indexMap.end()) {
//             size_t index = it->second;
//             delete sigma[index]; // Delete the object
//             // Shift elements to fill the gap
//             for (size_t i = index; i < size - 1; ++i) {
//                 sigma[i] = sigma[i + 1];
//                 indexMap[(uint64_t)sigma[i]] = i; // Update map
//             }
//             indexMap.erase(uid); // Remove UID-index mapping
//             --size;
//         }
//     }

//     // Function to retrieve object by UID
//     void* getObjectByUID(uint64_t uid) const {
//         auto it = indexMap.find(uid);
//         if (it != indexMap.end()) {
//             size_t index = it->second;
//             return sigma[index];
//         }
//         return nullptr; // Object not found
//     }
// };

int main() {
    std::unordered_map<std::string, void*> sigma;

    // Create some dynamic objects

    int* obj1 = new int(42);
    int* obj2 = new int(88);

    // Add objects to sigma
    sigma["obj1"] = obj1;
    sigma["obj2"] = obj2;

    // Retrieve object by UID
    void* retrievedObj = sigma["obj1"];
    if (retrievedObj) {
        std::cout << "Object found withvalue: " << *(int*)retrievedObj << std::endl;
    } else {
        std::cout << "Object not found." << std::endl;
    }

    delete obj1;
    delete obj2;

    return 0;
}