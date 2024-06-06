import { View } from "react-native";
import Button from "@/components/Button";
import React from "react";
import { supabase } from "@/lib/supabase";

const ProfileScreen = () => {
  return (
    <View>
      <Button
        onPress={async () => await supabase.auth.signOut()}
        text="Sign Out"
      />
    </View>
  );
};

export default ProfileScreen;
