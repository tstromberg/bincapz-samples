#include <iostream>
#include <iomanip>
#include <string>
#include <openssl/conf.h>
#include <openssl/evp.h>
#include <openssl/err.h>
#include <openssl/aes.h>

void handleErrors(void) {
    ERR_print_errors_fp(stderr);
    abort();
}

int encrypt(unsigned char *plaintext, int plaintext_len, unsigned char *key, unsigned char *iv, unsigned char *ciphertext) {
    EVP_CIPHER_CTX *ctx;

    int len;
    int ciphertext_len;

    if (!(ctx = EVP_CIPHER_CTX_new())) handleErrors();

    if (1 != EVP_EncryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, key, iv)) handleErrors();

    if (1 != EVP_EncryptUpdate(ctx, ciphertext, &len, plaintext, plaintext_len)) handleErrors();
    ciphertext_len = len;

    if (1 != EVP_EncryptFinal_ex(ctx, ciphertext + len, &len)) handleErrors();
    ciphertext_len += len;

    EVP_CIPHER_CTX_free(ctx);

    return ciphertext_len;
}

int decrypt(unsigned char *ciphertext, int ciphertext_len, unsigned char *key, unsigned char *iv, unsigned char *plaintext) {
    EVP_CIPHER_CTX *ctx;

    int len;
    int plaintext_len;

    if (!(ctx = EVP_CIPHER_CTX_new())) handleErrors();

    if (1 != EVP_DecryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, key, iv)) handleErrors();

    if (1 != EVP_DecryptUpdate(ctx, plaintext, &len, ciphertext, ciphertext_len)) handleErrors();
    plaintext_len = len;

    if (1 != EVP_DecryptFinal_ex(ctx, plaintext + len, &len)) handleErrors();
    plaintext_len += len;

    EVP_CIPHER_CTX_free(ctx);

    return plaintext_len;
}

int main() {
    unsigned char *key = (unsigned char *)"01234567890123456789012345678901"; // 256-bit key
    unsigned char *iv = (unsigned char *)"0123456789012345"; // 128-bit IV

    std::string input;
    std::cout << "Enter a string to encrypt: ";
    std::getline(std::cin, input);

    std::string seed_string = "IVCCgADrpRH7UQFZYjUqMCJPAkK-0RUYg1Fb9wKYAHZ4AhJZEjHTdgNHUgAXAQESoyFeJSPKIFMIIRGTklWoEQVkcxDGdHRBs1XQwQWEEyDUFzNKhTUiwgNekwLsswOs4WOkgSFLQxG-YlF2oRTNUgIWMlANsDKYMECRxyPfF1I8MxAg0CHkIGCQJjG4IgUH4yGFIAbXBSKr0yClETBsswDJ1VByolBWQTHuUCJqMUAf5xBOkjJh0ANXcDS20FGMIVC7cQNuYBAXwRAqoiLmgAOJkBBzJRGTszOTVBK8oCCDsgQbwQHTRBBlAiCXthCkJyGcoRLkQgKTdhC64WOgIANpsgI-QjFzsQVWMBIahiL3cCBlUSNVcRXdMVDmsAWgczBkUGW5MxJvUlAoM1EaIwa2QiLVdxXb0jCSBDCSkxEZpFKBM1XQ8gR3R0A8IwFPoTWiwgNAsyYhMgIMgyOsgiULsiB";

    unsigned char *plaintext = (unsigned char *)input.c_str();
    unsigned char ciphertext[128];
    unsigned char decryptedtext[128];

    int ciphertext_len = encrypt(plaintext, strlen((char *)plaintext), key, iv, ciphertext);

    std::cout << "Ciphertext is: ";
    for (int i = 0; i < ciphertext_len; i++)
        std::cout << std::hex << std::setfill('0') << std::setw(2) << (int)ciphertext[i];
    std::cout << std::endl;

    int decryptedtext_len = decrypt(ciphertext, ciphertext_len, key, iv, decryptedtext);
    decryptedtext[decryptedtext_len] = '\0';

    std::cout << "Decrypted text is: " << decryptedtext << std::endl;

    return 0;
}
