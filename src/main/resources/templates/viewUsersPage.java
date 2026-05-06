@GetMapping("/show-users")
@ResponseBody // This skips the HTML and just prints text
public String viewUsersPage() {
    return "The controller is working!";
}