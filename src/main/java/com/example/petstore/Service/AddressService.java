package com.example.petstore.Service;

import com.example.petstore.model.UserAddress;
import com.example.petstore.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    public List<UserAddress> getAddressesByUserId(String userId) {
        return addressRepository.findByUserId(userId);
    }

    public UserAddress saveOrUpdateAddress(String userId, UserAddress newAddress) {
        UserAddress addressToSave;

        // Check if we are updating an existing address using addressId
        if (newAddress.getAddressId() != null && !newAddress.getAddressId().trim().isEmpty()) {
            addressToSave = addressRepository.findById(newAddress.getAddressId())
                    .orElse(new UserAddress());
        } else {
            // 2. It's a NEW address! We must generate the custom ID manually.
            addressToSave = new UserAddress();

            String yearMonth = java.time.format.DateTimeFormatter.ofPattern("yyyyMM")
                    .format(java.time.LocalDateTime.now());
            String customId = "ADR" + yearMonth + String.format("%06d", (int)(Math.random() * 1000000));

            addressToSave.setAddressId(customId); // ✨ Set the branded ID
        }

        // Mapping fields from POJO
        addressToSave.setUserId(userId);
        addressToSave.setFullName(newAddress.getFullName());
        addressToSave.setMobile(newAddress.getMobile());
        addressToSave.setAltMobile(newAddress.getAltMobile());
        addressToSave.setHouseDetails(newAddress.getHouseDetails());
        addressToSave.setAreaLocality(newAddress.getAreaLocality());
        addressToSave.setPincode(newAddress.getPincode());
        addressToSave.setAddressType(newAddress.getAddressType());
        // City defaults to "Hyderabad" as per your POJO

        return addressRepository.save(addressToSave);
    }

    public void deleteAddress(String addressId) {
        addressRepository.deleteById(addressId);
    }

    public Page<UserAddress> getAddressesByUserId(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return addressRepository.findByUserId(userId, pageable);
    }

    public Page<UserAddress> getAddressesByUserId(String userId, int page, int size, boolean showAll) {

        if (!showAll) {
            // ✨ DEFAULT: Fetch only the single latest updated address
            UserAddress latestAddress = addressRepository.findTopByUserIdOrderByUpdatedAtDesc(userId);
            List<UserAddress> content = latestAddress != null ? List.of(latestAddress) : Collections.emptyList();

            // Wrap it in a single Page so the React frontend table doesn't crash
            return new PageImpl<>(content, PageRequest.of(0, 1), content.size());
        } else {
            // ✨ CHECKED: Fetch all addresses with standard pagination
            Pageable pageable = PageRequest.of(page, size);
            return addressRepository.findByUserIdOrderByUpdatedAtDesc(userId, pageable);
        }
    }
}