#include <iostream>
#include <memory>
#include <unordered_map>
#include <cstdint>

// Define a structure for dynamic objects
template<typename T> class RuntimeStateObject {
    T value;
    public:
        virtual int getUid() = 0 ;
        virtual int getValue(){
            return value;
        }
};



// Define a class to manage the dynamic structure and the map
class SigmaStructure {
private:
    void** sigma; // Dynamic structure
    std::unordered_map<uint64_t, size_t> indexMap; // Map to store UID-index pairs
    size_t size; // Current size of the structure
    size_t capacity; // Capacity of the structure

public:
    SigmaStructure(size_t initialCapacity = 10) : size(0), capacity(initialCapacity) {
        sigma = new void*[capacity];
    }

    ~SigmaStructure() {
        delete[] sigma;
    }

    // Function to add a dynamically created object
    template <typename T>
    void addObject(std::unique_ptr<RuntimeStateObject<T> > obj) {
        if (size >= capacity) {
            // Resize the sigma structure if needed
            capacity *= 2;
            void** temp = new void*[capacity];
            std::copy(sigma, sigma + size, temp);
            delete[] sigma;
            sigma = temp;
        }

        // Add the object to sigma
        int uid = obj->getUid();
        sigma[size] = obj.release(); // releasing ownership
        // Store the UID-index mapping
        indexMap[uid] = size;
        ++size;
    }

    // Function to remove object by UID
    template <typename T>
    void removeObject(uint64_t uid) {
        auto it = indexMap.find(uid);
        if (it != indexMap.end()) {
            size_t index = it->second;
            delete static_cast<RuntimeStateObject<T>*>(sigma[index]); // Delete the object
            // Shift elements to fill the gap
            for (size_t i = index; i < size - 1; ++i) {
                sigma[i] = sigma[i + 1];
                indexMap[static_cast<RuntimeStateObject<T>*>(sigma[i])->getUid()] = i; // Update map
            }
            indexMap.erase(uid); // Remove UID-index mapping
            --size;
        }
    }

    // Function to retrieve object by UID
    template <typename T>
    RuntimeStateObject<T>* getObjectByUID(uint64_t uid) const {
        auto it = indexMap.find(uid);
        if (it != indexMap.end()) {
            size_t index = it->second;
            return static_cast<RuntimeStateObject<T>*>(sigma[index]);
        }
        return nullptr; // Object not found
    }
};


class Integer: public RuntimeStateObject<int> {
        int uid;
    public:
        int value;
        Integer(int value, int uid): value(value), uid(uid) {}
        int getUid() override {
            return uid;
        }
};

template <typename T>
int main() {
    SigmaStructure sigma;

    // Create some dynamic objects
    std::unique_ptr<Integer> obj1(new Integer(1001,42));
    std::unique_ptr<Integer> obj2(new Integer(1002,88));

    // Add objects to sigma
    sigma.addObject(std::move(obj1));
    sigma.addObject(std::move(obj2));

    // Retrieve object by UID
    RuntimeStateObject<T>* retrievedObj = sigma.getObjectByUID(1001);
    if (retrievedObj) {
        std::cout << "Object found with UID: " << retrievedObj->getUid() << "value: " << retrievedObj->getValue() << std::endl;
    } else {
        std::cout << "Object not found." << std::endl;
    }

    return 0;
}